$(document).on('rex:ready', function() {
    $('input[data-relation-config]').each(function() {
        const input = this;
        if (input._select) {
            input._select.destroy();
            delete input._select;
        }
        
        const config = JSON.parse(input.dataset.relationConfig || '{}');
        const select = document.createElement('select');
        select.multiple = config.multiple !== false;
        input.parentNode.insertBefore(select, input);
        input.style.display = 'none';

        fetch(`index.php?rex-api-call=relation_select&table=${config.table}&value_field=${config.valueField}&label_field=${config.labelField}`)
            .then(response => response.json())
            .then(data => {
                const currentValues = input.value.split(',').filter(v => v);
                const ss = new SlimSelect({
                    select: select,
                    settings: {
                        allowDeselect: true,
                        placeholderText: config.placeholder || 'Bitte wählen...',
                        searchPlaceholder: 'Suchen...',
                        enableOrder: true
                    },
                    data: data.map(item => ({
                        value: item.value,
                        text: item.label,
                        selected: currentValues.includes(item.value.toString())
                    })),
                    events: {
                        afterChange: (values) => {
                            input.value = values.map(v => v.value).join(',');
                            $(input).trigger('change');
                        },
                        afterOrder: (values) => {
                            input.value = values.map(v => v.value).join(',');
                            $(input).trigger('change');
                        }
                    }
                });
                input._select = ss;
            });
    });
});
