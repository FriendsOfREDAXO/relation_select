$(document).on('rex:ready', function() {
    $('input[data-relation-config]').each(function() {
        const input = this;
        if (input._relationSelect) {
            const select = input.previousElementSibling;
            if (select && select._choices) {
                select._choices.destroy();
            }
            delete input._relationSelect;
        }
    });

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
            shouldSort: false,
            allowHTML: true,
            removeItems: true
        });

        input._relationSelect = true;

        fetch(`index.php?rex-api-call=relation_select&table=${config.table}&value_field=${config.valueField}&label_field=${config.labelField}`)
            .then(response => response.json())
            .then(data => {
                const currentValues = input.value.split(',').filter(v => v);
                choices.setChoices(data.map(item => ({
                    value: item.value,
                    label: item.label,
                    selected: currentValues.includes(item.value.toString())
                })));

                const list = wrapper.querySelector('.choices__list--multiple');
                
                if (config.sortable !== false && list) {
                    new Sortable(list, {
                        animation: 150,
                        draggable: '.choices__item',
                        handle: '.choices__item',
                        onStart: () => {
                            wrapper.classList.add('sorting');
                        },
                        onEnd: (evt) => {
                            wrapper.classList.remove('sorting');
                            if (evt.oldIndex !== evt.newIndex) {
                                const values = [];
                                list.querySelectorAll('.choices__item').forEach(item => {
                                    const value = item.dataset.value;
                                    if (value) values.push(value);
                                });
                                input.value = values.join(',');
                                $(input).trigger('change');
                            }
                        }
                    });
                }
            });

        choices.passedElement.element.addEventListener('change', function() {
            if (!wrapper.classList.contains('sorting')) {
                const values = choices.getValue(true);
                input.value = values.join(',');
                $(input).trigger('change');
            }
        });

        wrapper.addEventListener('mousedown', function(e) {
            if (e.target.closest('.choices__list--multiple')) {
                e.stopPropagation();
            }
        }, true);
    });
});
