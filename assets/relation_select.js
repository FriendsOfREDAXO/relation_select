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
            shouldSort: false
        });
        
        // Deaktiviere alle Choices-Events auf der Multiple List
        const listElement = wrapper.querySelector('.choices__list--multiple');
        const clone = listElement.cloneNode(true);
        listElement.parentNode.replaceChild(clone, listElement);

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
                    new Sortable(wrapper.querySelector('.choices__list--multiple'), {
                        draggable: '.choices__item',
                        onEnd: function() {
                            const values = [];
                            wrapper.querySelectorAll('.choices__item').forEach(item => {
                                const value = item.getAttribute('data-value');
                                if (value) values.push(value);
                            });
                            input.value = values.join(',');
                        }
                    });
                }
            });
    });
});
