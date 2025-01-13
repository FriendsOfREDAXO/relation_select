<?php
class rex_api_relation_select extends rex_api_function
{
    protected $published = true;

    function execute()
    {
        $table = rex_get('table', 'string');
        $valueField = rex_get('value_field', 'string');
        $labelField = rex_get('label_field', 'string');

        if (!$table || !$valueField || !$labelField) {
            throw new rex_api_exception('Missing parameters');
        }

        $sql = rex_sql::factory();
        $options = $sql->getArray("SELECT $valueField as value, $labelField as label FROM $table ORDER BY $labelField");

        header('Content-Type: application/json');
        echo json_encode($options);
        exit;
    }
}
