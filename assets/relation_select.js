$(document).on('rex:ready', function() {
    $('input[data-relation-config]').each(function() {
        const input = this;
        const config = JSON.parse(input.dataset.relationConfig || '{}');
        
        const select = document.createElement('select');
        select.multiple = config.multiple !== false;
        input.parentNode.insertBefore(select, input);
        input.style.display = 'none';
        
        const ts = new TomSelect(select, {
            valueField: 'value',
            labelField: 'label',
            searchField: 'label',
            plugins: ['remove_button', 'drag_drop'],
            placeholder: config.placeholder || 'Bitte wählen...',
            load: function(query, callback) {
                fetch(`index.php?rex-api-call=relation_select&table=${config.table}&value_field=${config.valueField}&label_field=${config.labelField}`)
                    .then(response => response.json())
                    .then(json => {
                        callback(json);
                    }).catch(() => {
                        callback();
                    });
            },
            onInitialize: function() {
                const self = this;
                const values = input.value.split(',').filter(v => v);
                if (values.length) {
                    self.load(function(callback) {
                        fetch(`index.php?rex-api-call=relation_select&table=${config.table}&value_field=${config.valueField}&label_field=${config.labelField}`)
                            .then(response => response.json())
                            .then(json => {
                                values.forEach(value => {
                                    const item = json.find(i => i.value.toString() === value);
                                    if (item) self.addOption(item);
                                });
                                values.forEach(value => self.addItem(value));
                                callback();
                            });
                    });
                }
            }
        });

        // Event Handler für Änderungen
        select.addEventListener('change', function() {
            const values = ts.getValue();
            input.value = Array.isArray(values) ? values.join(',') : values;
        });
    });
});
