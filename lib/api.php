<?php
class rex_api_relation_select extends rex_api_function
{
    protected $published = true;

    function execute()
    {
        $table = rex_get('table', 'string');
        $valueField = rex_get('value_field', 'string');
        $labelField = rex_get('label_field', 'string');
        $dbWhere = rex_get('dbw', 'string', '');
        $dbOrderBy = rex_get('dboy', 'string', '');

        if (!$table || !$valueField || !$labelField) {
            throw new rex_api_exception('Missing parameters');
        }

        $sql = rex_sql::factory();
        
        // Parse label fields and separators
        $parts = array_map('trim', explode('|', $labelField));
        $labelExpr = [];

        rex_logger::logError(1, 'Label parts: ' . print_r($parts, true));
        
        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }
            
            // Handle [[text]] parts and field names separately
            if (preg_match('/^\[\[(.+?)\]\]$/', $part, $matches)) {
                // It's a literal string
                $string = $matches[1];
                $labelExpr[] = "'" . $sql->escape($string) . "'";
                rex_logger::logError(1, 'Added literal: ' . $string);
            } else {
                // It's a field
                $labelExpr[] = $sql->escapeIdentifier($part);
                rex_logger::logError(1, 'Added field: ' . $part);
            }
        }

        // Add spaces between expressions
        $finalExpr = [];
        for ($i = 0; $i < count($labelExpr); $i++) {
            $finalExpr[] = $labelExpr[$i];
            if ($i < count($labelExpr) - 1) {
                $finalExpr[] = "' '";
            }
        }

        $labelExpr = "CONCAT(" . implode(', ', $finalExpr) . ") as label";
        rex_logger::logError(1, 'Final label expression: ' . $labelExpr);
        
        // Parse WHERE conditions
        $where = [];
        $params = [];
        if ($dbWhere) {
            $conditions = array_map('trim', explode(',', $dbWhere));
            foreach ($conditions as $condition) {
                $parsedCondition = $this->parseCondition($condition);
                if ($parsedCondition) {
                    $where[] = $parsedCondition['sql'];
                    if (isset($parsedCondition['value'])) {
                        $params[] = $parsedCondition['value'];
                    }
                }
            }
        }
        
        // Parse ORDER BY
        $orderClauses = [];
        if ($dbOrderBy) {
            $orders = array_map('trim', explode(',', $dbOrderBy));
            for ($i = 0; $i < count($orders); $i += 2) {
                $field = $orders[$i];
                $direction = isset($orders[$i + 1]) ? strtoupper($orders[$i + 1]) : 'ASC';
                if ($direction !== 'DESC') $direction = 'ASC';
                
                $orderClauses[] = $sql->escapeIdentifier($field) . ' ' . $direction;
            }
        }
        
        // Build query
        $query = "SELECT DISTINCT " . $sql->escapeIdentifier($valueField) . " as value, " 
               . $labelExpr . " FROM " 
               . $sql->escapeIdentifier($table);
        
        if (!empty($where)) {
            $query .= ' WHERE (' . implode(') AND (', $where) . ')';
        }
        
        if (!empty($orderClauses)) {
            $query .= ' ORDER BY ' . implode(', ', $orderClauses);
        } else {
            $query .= " ORDER BY label";
        }

        rex_logger::logError(1, 'Final query: ' . $query);
        rex_logger::logError(1, 'Parameters: ' . print_r($params, true));

        try {
            $options = $sql->getArray($query, $params);
            
            header('Content-Type: application/json');
            echo json_encode($options);
            exit;
            
        } catch (rex_sql_exception $e) {
            throw new rex_api_exception($e->getMessage());
        }
    }
    
    private function parseCondition($condition) 
    {
        $sql = rex_sql::factory();
        
        // Replace common date functions
        $condition = str_replace('now', 'CURRENT_TIMESTAMP', $condition);
        $condition = str_replace('today', 'CURRENT_DATE', $condition);
        
        // Teile die Bedingung beim ersten Auftreten von Operatoren
        $operators = ['!=', '>=', '<=', '=', '>', '<', '~'];
        $field = null;
        $operator = null;
        $value = null;
        
        foreach ($operators as $op) {
            if (strpos($condition, $op) !== false) {
                list($field, $value) = array_map('trim', explode($op, $condition, 2));
                $operator = $op;
                break;
            }
        }
        
        if ($field && $operator && $value !== null) {
            // Check for [[value]] syntax for strings with spaces
            if (preg_match('/^\[\[(.+?)\]\]$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            // Handle NULL values
            if (strtoupper($value) === 'NULL') {
                return [
                    'sql' => $sql->escapeIdentifier($field) . ($operator === '=' ? ' IS NULL' : ' IS NOT NULL')
                ];
            }
            
            // Handle date functions
            if (in_array($value, ['CURRENT_TIMESTAMP', 'CURRENT_DATE'])) {
                return [
                    'sql' => $sql->escapeIdentifier($field) . " $operator " . $value
                ];
            }
            
            // Handle string search with ~
            if ($operator === '~') {
                // Convert * wildcards to SQL % wildcards
                $value = str_replace('*', '%', $value);
                
                // If no wildcards were used, wrap in %...%
                if (strpos($value, '%') === false) {
                    $value = '%' . $value . '%';
                }
                
                return [
                    'sql' => $sql->escapeIdentifier($field) . ' LIKE ?',
                    'value' => $value
                ];
            }
            
            // Regular value with parameter binding
            return [
                'sql' => $sql->escapeIdentifier($field) . " $operator ?",
                'value' => $value
            ];
        }
        
        return null;
    }
}
