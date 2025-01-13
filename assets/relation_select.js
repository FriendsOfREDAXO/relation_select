$(document).on('rex:ready', function() {
    $('input[data-relation-config]').each(function() {
        const input = this;
        const config = JSON.parse(input.dataset.relationConfig || '{}');
        
        const wrapper = document.createElement('div');
        wrapper.className = 'relation-select-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        
        const select = document.createElement('select');
        select.multiple = config.multiple !== false;
        wrapper.appendChild(select);
        wrapper.appendChild(input);
        input.style.display = 'none';
        
        const choices = new Choices(select, {
            removeItemButton: true,
            duplicateItemsAllowed: false,
            placeholder: true,
            placeholderValue: config.placeholder || 'Bitte wählen...',
            searchPlaceholderValue: 'Suchen...',
            itemSelectText: '',
            shouldSort: false // Wichtig: choices.js Sortierung deaktivieren
        });

        select.addEventListener('change', function() {
            const values = Array.from(choices.getValue()).map(choice => choice.value);
            input.value = values.join(',');
        });

        fetch(`index.php?rex-api-call=relation_select&table=${config.table}&value_field=${config.valueField}&label_field=${config.labelField}`)
            .then(response => response.json())
            .then(data => {
                const currentValues = input.value.split(',').filter(v => v);
                choices.setChoices(data.map(item => ({
                    value: item.value,
                    label: item.label,
                    selected: currentValues.includes(item.value.toString())
                })));

                if (config.sortable !== false) {
                    // Sortable erst nach dem Laden der Choices initialisieren
                    setTimeout(() => {
                        new Sortable(wrapper.querySelector('.choices__list--multiple'), {
                            draggable: '.choices__item--selectable',
                            onEnd: function() {
                                const values = [];
                                wrapper.querySelectorAll('.choices__item--selectable').forEach(item => {
                                    values.push(item.dataset.value);
                                });
                                input.value = values.join(',');
                                // Choices aktualisieren
                                choices.clearStore();
                                values.forEach(value => {
                                    const item = data.find(i => i.value.toString() === value);
                                    if (item) {
                                        choices.addItem(item.label, item.value);
                                    }
                                });
                            }
                        });
                    }, 100);
                }
            });
    });
});
