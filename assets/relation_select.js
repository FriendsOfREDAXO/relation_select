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
            if ($(input).next('.relation-select-widget').length > 0 || $(input).data('relation-initialized')) {
                return;
            }
            $(input).data('relation-initialized', true);

            let config;
            const mode = input.dataset.relationMode || 'inline'; // 'inline' or 'modal'
            
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

            if (mode === 'modal') {
                // Modal mode: Create button and modal overlay
                const button = $(`
                    <button type="button" class="btn btn-default relation-select-open-modal">
                        <i class="fa fa-list"></i> Auswählen
                    </button>
                `);
                
                const modal = $(`
                    <div class="relation-select-modal">
                        <div class="relation-select-modal-overlay"></div>
                        <div class="relation-select-modal-dialog">
                            <div class="relation-select-modal-header">
                                <h4 class="relation-select-modal-title">Einträge auswählen</h4>
                                <button type="button" class="relation-select-modal-close">&times;</button>
                            </div>
                            <div class="relation-select-modal-body"></div>
                            <div class="relation-select-modal-footer">
                                <button type="button" class="btn btn-default relation-select-modal-cancel">Abbrechen</button>
                                <button type="button" class="btn btn-primary relation-select-modal-apply">Übernehmen</button>
                            </div>
                        </div>
                    </div>
                `);
                
                modal.find('.relation-select-modal-body').append(widget);
                $('body').append(modal);
                $(input).after(button);
                
                // Open modal
                button.on('click', function() {
                    modal.addClass('active');
                    $('body').addClass('relation-select-modal-open');
                });
                
                // Close modal
                modal.find('.relation-select-modal-close, .relation-select-modal-cancel, .relation-select-modal-overlay').on('click', function() {
                    modal.removeClass('active');
                    $('body').removeClass('relation-select-modal-open');
                });
                
                // Apply selection
                modal.find('.relation-select-modal-apply').on('click', function() {
                    modal.removeClass('active');
                    $('body').removeClass('relation-select-modal-open');
                });
                
                // ESC key to close
                $(document).on('keydown.relation-select-modal', function(e) {
                    if (e.key === 'Escape' && modal.hasClass('active')) {
                        modal.removeClass('active');
                        $('body').removeClass('relation-select-modal-open');
                    }
                });
                
            } else {
                // Inline mode: Insert widget directly after input
                $(input).hide().after(widget);
            }

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

            // Add timestamp cache buster
            params.append('_t', Date.now());

            const url = 'index.php?' + params.toString();
            
            // Load data
            fetch(url, {
                cache: 'no-store',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!Array.isArray(data)) {
                        throw new Error('Invalid data format received');
                    }
                    
                    const selectedValues = input.value.split(',').filter(v => v);
                    const availableList = widget.find('.available-list');
                    const selectedList = widget.find('.selected-list');
                    
                    // Create document fragment for better performance
                    const availableFragment = document.createDocumentFragment();
                    const selectedFragment = document.createDocumentFragment();
                    
                    // Fill available items
                    data.forEach(item => {
                        if (!selectedValues.includes(item.value.toString())) {
                            const escapedValue = $('<div>').text(item.value).html();
                            const escapedLabel = $('<div>').text(item.label).html();
                            const li = $(`
                                <li data-value="${escapedValue}">
                                    <span class="title">${escapedLabel}</span>
                                    <button type="button" class="btn btn-link add-item" aria-label="Hinzufügen">
                                        <i class="fa fa-plus"></i>
                                    </button>
                                </li>
                            `)[0];
                            availableFragment.appendChild(li);
                        }
                    });

                    // Fill selected items
                    selectedValues.forEach(value => {
                        const item = data.find(i => i.value.toString() === value);
                        if (item) {
                            const escapedValue = $('<div>').text(item.value).html();
                            const escapedLabel = $('<div>').text(item.label).html();
                            const li = $(`
                                <li data-value="${escapedValue}">
                                    <i class="fa fa-bars handle" aria-label="Sortieren"></i>
                                    <span class="title">${escapedLabel}</span>
                                    <button type="button" class="btn btn-link remove-item" aria-label="Entfernen">
                                        <i class="fa fa-minus"></i>
                                    </button>
                                </li>
                            `)[0];
                            selectedFragment.appendChild(li);
                        }
                    });
                    
                    // Append fragments to DOM (single reflow)
                    availableList[0].appendChild(availableFragment);
                    selectedList[0].appendChild(selectedFragment);

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

                    // Search functionality with debounce for better performance
                    let searchTimeout;
                    widget.find('.relation-select-search').on('input', function() {
                        clearTimeout(searchTimeout);
                        const search = this.value.toLowerCase();
                        searchTimeout = setTimeout(() => {
                            availableList.find('li').each(function() {
                                const text = $(this).find('.title').text().toLowerCase();
                                $(this).toggle(text.includes(search));
                            });
                        }, 200);
                    });

                    // Add item
                    widget.on('click', '.add-item', function() {
                        const li = $(this).closest('li');
                        const value = li.data('value');
                        const title = li.find('.title').text();
                        
                        const escapedValue = $('<div>').text(value).html();
                        const escapedTitle = $('<div>').text(title).html();
                        
                        selectedList.append(`
                            <li data-value="${escapedValue}">
                                <i class="fa fa-bars handle"></i>
                                <span class="title">${escapedTitle}</span>
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
                        
                        const escapedValue = $('<div>').text(value).html();
                        const escapedTitle = $('<div>').text(title).html();
                        
                        availableList.append(`
                            <li data-value="${escapedValue}">
                                <span class="title">${escapedTitle}</span>
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

