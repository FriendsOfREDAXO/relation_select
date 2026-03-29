<?php

namespace FriendsOfRedaxo\RelationSelect;

use rex_api_exception;
use rex_api_function;
use rex_api_result;
use rex_backend_login;
use rex_clang;
use rex_config;
use rex_response;
use rex_sql;
use rex_sql_exception;

use function count;
use function in_array;

class RelationSelect extends rex_api_function
{
    protected $published = true;

    public function execute(): never
    {
        rex_response::cleanOutputBuffers();

        // Security Check: Allow access if backend user is logged in OR valid token is provided
        $token = rex_get('token', 'string', '');
        $configuredToken = (string) rex_config::get('relation_select', 'api_token', '');

        $hasSession = rex_backend_login::hasSession();
        $tokenValid = '' !== $configuredToken && hash_equals($configuredToken, $token);

        if (!$hasSession && !$tokenValid) {
            throw new rex_api_exception('Access denied');
        }

        $table = rex_get('table', 'string', '');
        $valueField = rex_get('value_field', 'string', '');
        $labelField = rex_get('label_field', 'string', '');
        $displayFields = rex_get('display_fields', 'string', ''); // Additional fields for color, badge, etc.
        $clang = rex_get('clang', 'int', 0); // Language ID
        $dbWhere = rex_get('dbw', 'string', '');
        $dbOrderBy = rex_get('dbob', 'string', '');

        if ('' === $table || '' === $valueField || '' === $labelField) {
            throw new rex_api_exception('Missing parameters');
        }

        $sql = rex_sql::factory();

        // Resolve language for lang: prefix support
        // Two formats exist in REDAXO:
        //   ARRAY format (YForm lang_text):  [{"clang_id": 1, "value": "..."}, ...]
        //   OBJECT format (older addons):     {"de": "...", "nl": "..."}
        $clangId = $clang > 0 ? $clang : rex_clang::getCurrentId();
        $clangId = (int) $clangId;

        $langCode = 'de';
        $clangObj = rex_clang::get($clangId);
        if ($clangObj) {
            $langCode = preg_replace('/[^a-z]/', '', strtolower($clangObj->getCode()));
        }

        // Parse label fields
        // lang:fieldname → auto-detects JSON format per CASE JSON_TYPE():
        //   ARRAY  → [{"clang_id":N,"value":"..."}] (YForm lang_text type)
        //   OBJECT → {"de":"..."} (legacy/custom multi-lang objects)
        // plain fieldname → used as-is (BC)
        $fields = array_map('trim', explode('|', $labelField));
        $labelExpr = [];

        foreach ($fields as $field) {
            if ('' === $field) {
                continue;
            }
            if (str_starts_with($field, 'lang:')) {
                $realField = substr($field, 5);
                $ef = $sql->escapeIdentifier($realField);
                $clangIdSql = (string) $clangId;   // already cast to int – safe
                $langCodeSql = "'" . $langCode . "'"; // already sanitized with preg_replace
                // ARRAY: JSON_SEARCH finds the path to the matching clang_id entry,
                //        REPLACE swaps 'clang_id' → 'value' in the path, JSON_UNQUOTE
                //        strips outer quotes so JSON_EXTRACT gets a clean path.
                // OBJECT: plain key lookup by language code.
                $labelExpr[] = 'COALESCE('
                    . 'CASE JSON_TYPE(' . $ef . ') '
                    . "WHEN 'ARRAY' THEN JSON_UNQUOTE(JSON_EXTRACT(" . $ef . ', JSON_UNQUOTE(REPLACE(JSON_SEARCH(' . $ef . ", 'one', " . $clangIdSql . ", NULL, '\$[*].clang_id'), 'clang_id', 'value')))) "
                    . "WHEN 'OBJECT' THEN JSON_UNQUOTE(JSON_EXTRACT(" . $ef . ", '\$." . $langCode . "')) "
                    . 'ELSE NULL END, '
                    . $ef
                    . ')';
            } else {
                $labelExpr[] = $sql->escapeIdentifier($field);
            }
        }

        $labelExpr = 'CONCAT(' . implode(", ' ', ", $labelExpr) . ') as label';

        // Parse display fields for additional data (color, status, etc.)
        // Format: "color:feldname|badge:feldname|reinesfeld" – Präfix vor ":" wird entfernt
        $additionalFields = [];
        if ('' !== $displayFields) {
            $displayFieldsList = array_map('trim', explode('|', $displayFields));
            foreach ($displayFieldsList as $displayField) {
                if ('' === $displayField) {
                    continue;
                }
                // Präfix wie "badge:", "color:" etc. entfernen → nur den Feldnamen verwenden
                $colonPos = strpos($displayField, ':');
                $fieldName = false !== $colonPos ? substr($displayField, $colonPos + 1) : $displayField;
                $fieldName = trim($fieldName);
                if ('' !== $fieldName) {
                    $additionalFields[] = $sql->escapeIdentifier($fieldName);
                }
            }
        }

        // Parse WHERE conditions
        $where = [];
        $params = [];
        
        // Add clang filter for multi-language tables (rex_article, rex_article_slice)
        if ($clang > 0 && in_array($table, ['rex_article', 'rex_article_slice'], true)) {
            $where[] = 'clang_id = ' . (int) $clang;
        }
        
        if ('' !== $dbWhere) {
            $conditions = array_map('trim', explode(',', $dbWhere));
            foreach ($conditions as $condition) {
                $parsedCondition = $this->parseCondition(trim($condition));
                if (null !== $parsedCondition) {
                    $where[] = $parsedCondition['sql'];
                    if (isset($parsedCondition['value'])) {
                        $params[] = $parsedCondition['value'];
                    }
                }
            }
        }

        // Parse ORDER BY
        $orderClauses = [];
        if ('' !== $dbOrderBy) {
            $orders = array_map('trim', explode(',', $dbOrderBy));
            for ($i = 0; $i < count($orders); $i += 2) {
                $field = $orders[$i];
                $direction = isset($orders[$i + 1]) ? strtoupper($orders[$i + 1]) : 'ASC';
                if ('DESC' !== $direction) {
                    $direction = 'ASC';
                }

                $orderClauses[] = $sql->escapeIdentifier($field) . ' ' . $direction;
            }
        }

        // Build SELECT fields array
        $selectFields = [$sql->escapeIdentifier($valueField) . ' as value', $labelExpr];
        if (count($additionalFields) > 0) {
            $selectFields = array_merge($selectFields, $additionalFields);
        }
        
        // Build query
        $query = 'SELECT DISTINCT ' . implode(', ', $selectFields) . ' FROM '
               . $sql->escapeIdentifier($table);

        if (count($where) > 0) {
            $query .= ' WHERE ' . implode(' AND ', $where);
        }

        if (count($orderClauses) > 0) {
            $query .= ' ORDER BY ' . implode(', ', $orderClauses);
        } else {
            $query .= ' ORDER BY label';
        }

        try {
            // Always create fresh SQL instance to avoid cached results
            $freshSql = rex_sql::factory();
            $options = $freshSql->getArray($query, $params);

            rex_response::sendJson($options);
            exit;
        } catch (rex_sql_exception $e) {
            throw new rex_api_exception($e->getMessage());
        }
    }

    /**
     * @return array{sql: string, value?: string}|null
     */
    private function parseCondition(string $condition): ?array
    {
        $sql = rex_sql::factory();

        // Remove all extra whitespace and trim
        $condition = trim(preg_replace('/\s+/', ' ', $condition));

        // Replace common date functions
        $condition = str_replace('now', 'CURRENT_TIMESTAMP', $condition);
        $condition = str_replace('today', 'CURRENT_DATE', $condition);

        // Find operator and split condition
        $operators = ['!=', '>=', '<=', '=', '>', '<', '~'];
        $field = null;
        $operator = null;
        $value = null;

        foreach ($operators as $op) {
            $parts = explode($op, $condition);
            if (2 === count($parts)) {
                $field = trim($parts[0]);
                $value = trim($parts[1]);
                $operator = $op;
                break;
            }
        }

        if (null !== $field && null !== $operator && null !== $value) {
            // Handle NULL values
            if ('NULL' === strtoupper($value)) {
                return [
                    'sql' => $sql->escapeIdentifier($field) . ('=' === $operator ? ' IS NULL' : ' IS NOT NULL'),
                ];
            }

            // Handle date functions
            if (in_array($value, ['CURRENT_TIMESTAMP', 'CURRENT_DATE'], true)) {
                return [
                    'sql' => $sql->escapeIdentifier($field) . " $operator " . $value,
                ];
            }

            // Handle string search with ~
            if ('~' === $operator) {
                // Convert * wildcards to SQL % wildcards
                $value = str_replace('*', '%', $value);

                // If no wildcards were used, wrap in %...%
                if (!str_contains($value, '%')) {
                    $value = '%' . $value . '%';
                }

                return [
                    'sql' => $sql->escapeIdentifier($field) . ' LIKE ?',
                    'value' => $value,
                ];
            }

            // Regular value with parameter binding
            return [
                'sql' => $sql->escapeIdentifier($field) . " $operator ?",
                'value' => $value,
            ];
        }

        return null;
    }
}
