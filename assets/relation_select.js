// relation_select.js
$(document).on('rex:ready', function() {
    // Cleanup old instances and make sure we don't double-initialize
    $('.relation-select-widget').each(function() {
        const input = $(this).prev('input[data-relation-config]');
        if (input.length) {
            input.show();
        }
        $(this).remove();
    });

    $('input[data-relation-config]').each(function() {
        // Skip if already initialized
        if ($(this).next('.relation-select-widget').length) {
            return;
        }

        const input = this;
        const config = JSON.parse(input.dataset.relationConfig || '{}');
        
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

        // Build API URL with all parameters
        const apiUrl = new URL('index.php', window.location.href);
        apiUrl.searchParams.set('rex-api-call', 'relation_select');
        apiUrl.searchParams.set('table', config.table);
        apiUrl.searchParams.set('value_field', config.valueField);
        apiUrl.searchParams.set('label_field', config.labelField);
        
        // Add new filter and sort parameters if present
        if (config.dbw) {
            apiUrl.searchParams.set('dbw', config.dbw);
        }
        if (config.dboy) {
            apiUrl.searchParams.set('dboy', config.dboy);
        }

        // Load data
        fetch(apiUrl.toString())
            .then(response => response.json())
            .then(data => {
                const selectedValues = input.value.split(',').filter(v => v);
                const availableList = widget.find('.available-list');
                const selectedList = widget.find('.selected-list');

                // Clear lists before filling
                availableList.empty();
                selectedList.empty();
                
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

                // Make selected list sortable only once
                if (!widget.data('sortable-initialized')) {
                    new Sortable(selectedList[0], {
                        handle: '.handle',
                        animation: 150,
                        onSort: () => updateValue()
                    });
                    widget.data('sortable-initialized', true);
                }

                // Bind events only once
                if (!widget.data('events-initialized')) {
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

                    widget.data('events-initialized', true);
                }

                function updateValue() {
                    const values = [];
                    selectedList.find('li').each(function() {
                        values.push($(this).data('value'));
                    });
                    input.value = values.join(',');
                    $(input).trigger('change');
                }
            });
    });
});
