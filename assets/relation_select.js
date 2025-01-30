// relation_select.js
$(document).on('rex:ready', function() {
    // Cleanup old instances
    $('.relation-select-widget').remove();

    $('input[data-relation-config]').each(function() {
        const input = this;
        let config;
        
        try {
            config = JSON.parse(input.dataset.relationConfig || '{}');
        } catch (e) {
            console.error('Invalid relation config:', e);
            return;
        }

        // Check required config
        if (!config.table || !config.valueField || !config.labelField) {
            console.error('Missing required config parameters');
            return;
        }
        
        // Create widget structure
        const widget = $(`
            <div class="relation-select-widget">
                <div class="relation-select-available">
                    <input type="text" class="form-control relation-select-search" placeholder="Suchen...">
                    <ul class="relation-select-list available-list"></ul>
                </div>
                <div class="relation-select-selected">
                    <div class="relation-select-header">Ausgewählte Einträge</div>
                    <ul class="relation-select-list selected-list"></ul>
                </div>
            </div>
        `);

        $(input).hide().after(widget);

        // Build API URL using URLSearchParams for proper encoding
        const params = new URLSearchParams({
            'rex-api-call': 'relation_select',
            'table': config.table,
            'value_field': config.valueField,
            'label_field': config.labelField
        });

        // Add optional parameters if they exist
        if (config.dbw) {
            params.append('dbw', config.dbw);
        }
        if (config.dbob) {
            params.append('dbob', config.dbob);
        }

        const url = 'index.php?' + params.toString();
        console.log('API URL:', url); // Debug output

        // Load data
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const selectedValues = input.value.split(',').filter(v => v);
                const availableList = widget.find('.available-list');
                const selectedList = widget.find('.selected-list');
                
                // Fill available items
                data.forEach(item => {
                    if (!selectedValues.includes(item.value.toString())) {
                        availableList.append(`
                            <li data-value="${item.value}">
                                <span class="title">${item.label}</span>
                                <button type="button" class="btn btn-link add-item">
                                    <i class="fa fa-plus"></i>
                                </button>
                            </li>
                        `);
                    }
                });

                // Fill selected items
                selectedValues.forEach(value => {
                    const item = data.find(i => i.value.toString() === value);
                    if (item) {
                        selectedList.append(`
                            <li data-value="${item.value}">
                                <i class="fa fa-bars handle"></i>
                                <span class="title">${item.label}</span>
                                <button type="button" class="btn btn-link remove-item">
                                    <i class="fa fa-minus"></i>
                                </button>
                            </li>
                        `);
                    }
                });

                // Make selected list sortable
                new Sortable(selectedList[0], {
                    handle: '.handle',
                    animation: 150,
                    onSort: () => updateValue()
                });

                // Search functionality
                widget.find('.relation-select-search').on('input', function() {
                    const search = this.value.toLowerCase();
                    availableList.find('li').each(function() {
                        const text = $(this).find('.title').text().toLowerCase();
                        $(this).toggle(text.includes(search));
                    });
                });

                // Add item
                widget.on('click', '.add-item', function() {
                    const li = $(this).closest('li');
                    const value = li.data('value');
                    const title = li.find('.title').text();
                    
                    selectedList.append(`
                        <li data-value="${value}">
                            <i class="fa fa-bars handle"></i>
                            <span class="title">${title}</span>
                            <button type="button" class="btn btn-link remove-item">
                                <i class="fa fa-minus"></i>
                            </button>
                        </li>
                    `);
                    li.remove();
                    updateValue();
                });

                // Remove item
                widget.on('click', '.remove-item', function() {
                    const li = $(this).closest('li');
                    const value = li.data('value');
                    const title = li.find('.title').text();
                    
                    availableList.append(`
                        <li data-value="${value}">
                            <span class="title">${title}</span>
                            <button type="button" class="btn btn-link add-item">
                                <i class="fa fa-plus"></i>
                            </button>
                        </li>
                    `);
                    li.remove();
                    updateValue();
                });

                function updateValue() {
                    const values = [];
                    selectedList.find('li').each(function() {
                        values.push($(this).data('value'));
                    });
                    input.value = values.join(',');
                    $(input).trigger('change');
                }
            })
            .catch(error => {
                console.error('Error loading data:', error);
                widget.find('.available-list').html('<li class="error">Fehler beim Laden der Daten</li>');
            });
    });
});
