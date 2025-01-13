$(document).on('rex:ready', function() {
    // Destroy existing instances
    $('input[data-relation-config]').each(function() {
        const select = this.previousElementSibling;
        if (select && select._tomSelect) {
            select._tomSelect.destroy();
        }
    });

    // Initialize new instances
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
            plugins: {
                remove_button: {},
                drag_drop: {
                    onDrop: function() {
                        setTimeout(() => {
                            input.value = ts.getValue().join(',');
                            $(input).trigger('change');
                        }, 10);
                    }
                }
            },
            placeholder: config.placeholder || 'Bitte wählen...',
            load: function(query, callback) {
                fetch(`index.php?rex-api-call=relation_select&table=${config.table}&value_field=${config.valueField}&label_field=${config.labelField}`)
                    .then(response => response.json())
                    .then(callback).catch(() => callback());
            },
            onInitialize: function() {
                const self = this;
                const values = input.value.split(',').filter(v => v);
                if (values.length) {
                    self.load(function(json) {
                        values.forEach(value => {
                            const item = json.find(i => i.value.toString() === value.toString());
                            if (item) {
                                self.addOption(item);
                                self.addItem(value);
                            }
                        });
                    });
                }
            },
            onChange: function(value) {
                input.value = Array.isArray(value) ? value.join(',') : value;
                $(input).trigger('change');
            }
        });
    });
});
