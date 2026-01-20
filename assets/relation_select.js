(function($) {
    const translations = {
        'de': {
            search_placeholder: 'Suchen...',
            selected_items: 'Ausgewählte Einträge',
            error_loading: 'Fehler beim Laden der Daten'
        },
        'en': {
            search_placeholder: 'Search...',
            selected_items: 'Selected items',
            error_loading: 'Error loading data'
        }
    };

    function getI18n() {
        // 1. Try REDAXO Backend properties
        if (typeof rex !== 'undefined' && rex.relation_select) {
            return rex.relation_select;
        }

        // 2. Try HTML lang attribute
        const lang = document.documentElement.lang.substr(0, 2).toLowerCase();
        if (translations[lang]) {
            return translations[lang];
        }

        // 3. Fallback to German
        return translations['de'];
    }

    function initRelationSelect(container) {
        const i18n = getI18n();

        $(container).find('input[data-relation-config]').each(function() {
            const input = this;
            
            // Prevent double initialization
            if ($(input).next('.relation-select-widget').length > 0) {
                return;
            }

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
                        <input type="text" class="form-control relation-select-search" placeholder="${i18n.search_placeholder}">
                        <ul class="relation-select-list available-list"></ul>
                    </div>
                    <div class="relation-select-selected">
                        <div class="relation-select-header">${i18n.selected_items}</div>
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
            
            // Add token if provided in config (for frontend usage)
            if (config.token) {
                params.append('token', config.token);
            }

            const url = 'index.php?' + params.toString();
            
            // Load data
            fetch(url, {
                cache: 'no-store'
            })
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
                    if (typeof Sortable !== 'undefined') {
                        new Sortable(selectedList[0], {
                            handle: '.handle',
                            animation: 150,
                            onSort: () => updateValue()
                        });
                    } else {
                        console.warn('SortableJS not found. Sorting disabled.');
                    }

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
                    widget.find('.available-list').html(`<li class="error">${i18n.error_loading}</li>`);
                });
        });
    }

    // Init on rex:ready (Backend)
    $(document).on('rex:ready', function(e, container) {
        initRelationSelect(container);
    });

    // Init on document ready (Frontend)
    $(function() {
        initRelationSelect(document);
    });

})(jQuery);

