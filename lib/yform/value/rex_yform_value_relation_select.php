<?php

/**
 * YForm Value: Relation Select
 *
 * Rendert das Relation Select Widget in YForm-Formularen.
 * Unterstützt Suche in der YForm Table Manager Liste.
 *
 * @package relation_select
 */
class rex_yform_value_relation_select extends rex_yform_value_abstract
{
    public function enterObject(): void
    {
        $value = (string) ($this->getValue() ?? '');
        $this->setValue($value);

        $this->params['value_pool']['email'][$this->getName()] = $value;

        if ($this->saveInDb()) {
            $this->params['value_pool']['sql'][$this->getName()] = $value;
        }

        if ($this->needsOutput() && $this->isViewable()) {
            $multiple = (bool) $this->getElement('multiple');

            $this->params['form_output'][$this->getId()] = $this->parse(
                'value.relation_select.tpl.php',
                [
                    'table'          => (string) $this->getElement('table'),
                    'value_field'    => (string) ($this->getElement('value_field') ?: 'id'),
                    'label_field'    => (string) $this->getElement('label_field'),
                    'display_fields' => (string) $this->getElement('display_fields'),
                    'filter'         => (string) $this->getElement('filter'),
                    'order_by'       => (string) $this->getElement('order_by'),
                    'multiple'       => $multiple,
                ],
            );
        }
    }

    public function getDescription(): string
    {
        return 'relation_select|name|label|table|value_field|label_field|[display_fields]|[filter]|[order_by]|[multiple]';
    }

    /**
     * @return array<string, mixed>
     */
    public function getDefinitions(): array
    {
        return [
            'type'        => 'value',
            'name'        => 'relation_select',
            'values'      => [
                'name'           => ['type' => 'name',    'label' => rex_i18n::msg('yform_values_defaults_name')],
                'label'          => ['type' => 'text',    'label' => rex_i18n::msg('yform_values_defaults_label')],
                'table'          => ['type' => 'text',    'label' => rex_i18n::msg('relation_select_yform_table'),
                    'notice' => rex_i18n::msg('relation_select_yform_table_notice')],
                'value_field'    => ['type' => 'text',    'label' => rex_i18n::msg('relation_select_yform_value_field'),
                    'default' => 'id',
                    'notice' => rex_i18n::msg('relation_select_yform_value_field_notice')],
                'label_field'    => ['type' => 'text',    'label' => rex_i18n::msg('relation_select_yform_label_field'),
                    'notice' => rex_i18n::msg('relation_select_yform_label_field_notice')],
                'display_fields' => ['type' => 'text',    'label' => rex_i18n::msg('relation_select_yform_display_fields'),
                    'notice' => rex_i18n::msg('relation_select_yform_display_fields_notice')],
                'filter'         => ['type' => 'text',    'label' => rex_i18n::msg('relation_select_yform_filter'),
                    'notice' => rex_i18n::msg('relation_select_yform_filter_notice')],
                'order_by'       => ['type' => 'text',    'label' => rex_i18n::msg('relation_select_yform_order_by'),
                    'notice' => rex_i18n::msg('relation_select_yform_order_by_notice')],
                'multiple'       => ['type' => 'boolean', 'label' => rex_i18n::msg('relation_select_yform_multiple'),
                    'default' => 1],
                'notice'         => ['type' => 'text',    'label' => rex_i18n::msg('yform_values_defaults_notice')],
            ],
            'description' => rex_i18n::msg('relation_select_yform_description'),
            'db_type'     => ['text', 'varchar(191)'],
            'famous'      => false,
        ];
    }

    /**
     * Lädt alle Einträge aus der Relation-Tabelle und gibt sie als Choices-Array zurück.
     *
     * @param rex_yform_manager_field $field
     * @return array<string, string>
     */
    private static function buildChoicesArray(rex_yform_manager_field $field): array
    {
        $table       = (string) $field->getElement('table');
        $valueField  = (string) ($field->getElement('value_field') ?: 'id');
        $labelFields = array_filter(array_map('trim', explode('|', (string) $field->getElement('label_field'))));
        $orderBy     = (string) $field->getElement('order_by');

        if ('' === $table || [] === $labelFields) {
            return [];
        }

        try {
            $sql = rex_sql::factory();

            $labelExpr = count($labelFields) > 1
                ? 'CONCAT(' . implode(", ' ', ", array_map([$sql, 'escapeIdentifier'], $labelFields)) . ')'
                : $sql->escapeIdentifier($labelFields[0]);

            $query = 'SELECT '
                . $sql->escapeIdentifier($valueField) . ' AS val, '
                . $labelExpr . ' AS lbl '
                . 'FROM ' . $sql->escapeIdentifier($table);

            if ('' !== $orderBy) {
                $orderClauses = [];
                $parts = array_map('trim', explode(',', $orderBy));
                for ($i = 0, $iMax = count($parts); $i < $iMax; $i += 2) {
                    $orderField = $parts[$i];
                    $direction  = isset($parts[$i + 1]) && 'DESC' === strtoupper(trim($parts[$i + 1])) ? 'DESC' : 'ASC';
                    if ('' !== $orderField) {
                        $orderClauses[] = $sql->escapeIdentifier($orderField) . ' ' . $direction;
                    }
                }
                if ([] !== $orderClauses) {
                    $query .= ' ORDER BY ' . implode(', ', $orderClauses);
                }
            }

            $sql->setQuery($query);
            $choices = [];
            while ($sql->hasNext()) {
                $val = (string) $sql->getValue('val');
                $lbl = (string) $sql->getValue('lbl');
                $choices[$val] = $lbl;
                $sql->next();
            }

            return $choices;
        } catch (rex_sql_exception $e) {
            rex_logger::logException($e);
            return [];
        }
    }

    /**
     * Suchfeld: Einfaches Dropdown mit allen Einträgen aus der Relation-Tabelle.
     * Ermöglicht die Filterung nach einem einzelnen Datensatz.
     *
     * @param array<string, mixed> $params
     */
    public static function getSearchField(array $params): void
    {
        /** @var rex_yform_manager_field $field */
        $field   = $params['field'];
        $choices = self::buildChoicesArray($field);

        // Leerer Eintrag am Anfang erlaubt das Zurücksetzen des Suchfilters
        $choicesWithEmpty = ['' => rex_i18n::msg('relation_select_search_empty_option')] + $choices;

        $params['searchForm']->setValueField('choice', [
            'name'     => $field->getName(),
            'label'    => $field->getLabel(),
            'expanded' => false,
            'multiple' => false,
            'no_db'    => true,
            'choices'  => $choicesWithEmpty,
        ]);
    }

    /**
     * Suchfilter: Filtert anhand des gewählten Wertes im Dropdown.
     * Da das Feld kommaseparierte IDs speichert, wird whereListContains verwendet.
     *
     * @param array<string, mixed> $params
     */
    public static function getSearchFilter(array $params): rex_yform_manager_query
    {
        $value = trim((string) $params['value']);

        /** @var rex_yform_manager_query $query */
        $query = $params['query'];

        if ('' === $value) {
            return $query;
        }

        $fieldName = $query->getTableAlias() . '.' . $params['field']->getName();

        return $query->whereListContains($fieldName, $value);
    }

    /**
     * Listendarstellung: Bei einem Datensatz dessen Label, bei mehreren nur den Zähler.
     *
     * @param array<string, mixed> $params
     */
    public static function getListValue(array $params): string
    {
        $field = $params['params']['field'];
        $value = (string) ($params['value'] ?? '');

        if ('' === $value) {
            return '';
        }

        $ids = array_values(array_filter(array_map('trim', explode(',', $value))));

        if ([] === $ids) {
            return '';
        }

        $total = count($ids);

        // Mehr als ein Eintrag: nur Anzahl als Badge
        if ($total > 1) {
            return '<span style="display:inline-block;background:var(--color-brand,#20aded);color:#fff;border-radius:10px;padding:1px 8px;font-size:0.85em;white-space:nowrap;">'
                . $total . ' ' . rex_i18n::msg('relation_select_list_records')
                . '</span>';
        }

        // Genau ein Eintrag: Label aus der Datenbank laden
        $table       = (string) ($field['table'] ?? '');
        $valueField  = (string) ($field['value_field'] ?: 'id');
        $labelRaw    = (string) ($field['label_field'] ?? '');
        $labelFields = array_filter(array_map('trim', explode('|', $labelRaw)));

        if ('' === $table || [] === $labelFields) {
            return rex_escape($ids[0]);
        }

        try {
            $sql = rex_sql::factory();

            $labelExpr = count($labelFields) > 1
                ? 'CONCAT(' . implode(", ' ', ", array_map([$sql, 'escapeIdentifier'], $labelFields)) . ')'
                : $sql->escapeIdentifier($labelFields[0]);

            $sql->setQuery(
                'SELECT ' . $labelExpr . ' AS lbl'
                . ' FROM ' . $sql->escapeIdentifier($table)
                . ' WHERE ' . $sql->escapeIdentifier($valueField) . ' = ' . $sql->escape($ids[0])
                . ' LIMIT 1',
            );

            if ($sql->hasNext()) {
                return rex_escape((string) $sql->getValue('lbl'));
            }

            return rex_escape($ids[0]);
        } catch (rex_sql_exception $e) {
            rex_logger::logException($e);
            return rex_escape($ids[0]);
        }
    }
}
