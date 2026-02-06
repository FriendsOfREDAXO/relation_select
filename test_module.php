<!-- Test Modul für relation_select -->
<h3>Test: Modal Mode</h3>
<div class="form-group">
    <label>Modal Mode (REX_VALUE[1])</label>
    <input type="text" 
        name="REX_INPUT_VALUE[1]" 
        value="REX_VALUE[1]"
        data-relation-mode="modal"
        data-relation-config='{
            "table": "rex_article",
            "valueField": "id",
            "labelField": "name"
        }'
    >
    <small>Aktueller Wert: REX_VALUE[1]</small>
</div>

<h3>Test: Inline Mode</h3>
<div class="form-group">
    <label>Inline Mode (REX_VALUE[2])</label>
    <input type="text" 
        name="REX_INPUT_VALUE[2]" 
        value="REX_VALUE[2]"
        data-relation-config='{
            "table": "rex_article",
            "valueField": "id",
            "labelField": "name"
        }'
    >
    <small>Aktueller Wert: REX_VALUE[2]</small>
</div>

<script>
// Debug: Zeige Werte vor dem Speichern
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            console.log('=== FORM SUBMIT DEBUG ===');
            document.querySelectorAll('input[data-relation-config]').forEach(function(input) {
                console.log('Input name:', input.name);
                console.log('Input value:', input.value);
                console.log('Input type:', input.type);
                console.log('---');
            });
        });
    }
});
</script>
