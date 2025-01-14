<?php 
class rex_api_relation_select extends rex_api_function
{
    protected $published = true;

    function execute()
    {
        // ... [vorheriger Code bleibt gleich] ...
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
            
            // Regular value
            return [
                'sql' => $sql->escapeIdentifier($field) . " $operator ?",
                'value' => $value
            ];
        }
        
        return null;
    }
}
