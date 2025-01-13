$(document).on('rex:ready', function() {
    // Destroy existing instances
    $('input[data-relation-config]').each(function() {
        const select = this.previousElementSibling;
        if (select && select._choices) {
            select._choices.destroy();
        }
    });

    // Initialize new instances
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

        // Load options via AJAX
        fetch(`index.php?rex-api-call=relation_select&table=${config.table}&value_field=${config.valueField}&label_field=${config.labelField}`)
            .then(response => response.json())
            .then(data => {
                const currentValues = input.value.split(',').filter(v => v);
                choices.setChoices(data.map(item => ({
                    value: item.value,
                    label: item.label,
                    selected: currentValues.includes(item.value.toString())
                })));

                // Initialize Sortable after Choices is loaded
                if (config.sortable !== false) {
                    const sortable = new Sortable(wrapper.querySelector('.choices__list--multiple'), {
                        draggable: '.choices__item',
                        onStart: () => {
                            wrapper.classList.add('sorting');
                        },
                        onEnd: () => {
                            wrapper.classList.remove('sorting');
                            const values = [];
                            wrapper.querySelectorAll('.choices__item').forEach(item => {
                                const value = item.getAttribute('data-value');
                                if (value) values.push(value);
                            });
                            input.value = values.join(',');
                            $(input).trigger('change');
                        }
                    });
                }
            });

        // Update hidden input when selection changes
        select.addEventListener('change', function() {
            if (!wrapper.classList.contains('sorting')) {
                const values = choices.getValue(true);
                input.value = values.join(',');
                $(input).trigger('change');
            }
        });

        // Prevent dropdown from opening when sorting
        wrapper.addEventListener('mousedown', function(e) {
            if (e.target.closest('.choices__list--multiple')) {
                e.stopPropagation();
            }
        }, true);
    });
});
