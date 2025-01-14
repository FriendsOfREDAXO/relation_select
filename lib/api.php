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
        $query = "SELECT $valueField as value, $labelField as label FROM $table";
        if (!empty($where)) {
            $query .= ' WHERE ' . implode(' AND ', $where);
        }
        if (!empty($orderClauses)) {
            $query .= ' ORDER BY ' . implode(', ', $orderClauses);
        } else {
            $query .= " ORDER BY $labelField";
        }
        
        $options = $sql->getArray($query, $params);

        header('Content-Type: application/json');
        echo json_encode($options);
        exit;
    }
    
    private function parseCondition($condition)
    {
        // Replace common date functions
        $condition = str_replace('now', 'CURRENT_TIMESTAMP', $condition);
        $condition = str_replace('today', 'CURRENT_DATE', $condition);
        
        // Match patterns like "field != value" or "field = value"
        if (preg_match('/^([a-zA-Z0-9_]+)\s*(!=|=|>|<|>=|<=)\s*(.+)$/', trim($condition), $matches)) {
            $field = $matches[1];
            $operator = $matches[2];
            $value = trim($matches[3]);
            
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
            
            // Regular value
            return [
                'sql' => $sql->escapeIdentifier($field) . " $operator ?",
                'value' => $value
            ];
        }
        
        return null;
    }
}
