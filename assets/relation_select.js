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

    /**
     * Format label with enhanced syntax support
     * @param {Object} item - Data item with value, label and optional display fields
     * @param {Object} config - Configuration with labelFormat and displayFormat options
     * @returns {string} Formatted HTML label
     */
    function formatLabel(item, config) {
        let html = '';
        
        // Check for enhanced label format
        const labelFormat = config.labelFormat || '';
        const displayFormat = config.displayFormat || '';
        
        if (displayFormat) {
            // Parse display format: "color:fieldname|badge:status|(id)"
            const parts = displayFormat.split('|');
            parts.forEach(part => {
                part = part.trim();
                
                // Color preview: "color:fieldname"
                if (part.startsWith('color:')) {
                    const fieldName = part.substring(6);
                    const fieldValue = item[fieldName] ? String(item[fieldName]).trim() : '';
                    if (fieldValue !== '') {
                        const color = $('<div>').text(fieldValue).html();
                        html += `<span class="relation-color-preview" style="background-color: ${color}"></span>`;
                    } else {
                        // Show placeholder for empty color
                        html += `<span class="relation-color-preview relation-color-empty"></span>`;
                    }
                }
                // Badge: "badge:fieldname"
                else if (part.startsWith('badge:')) {
                    const fieldName = part.substring(6);
                    const fieldValue = item[fieldName] ? String(item[fieldName]).trim() : '';
                    if (fieldValue !== '') {
                        const badgeText = $('<div>').text(fieldValue).html();
                        html += `<span class="relation-badge">${badgeText}</span>`;
                    }
                    // Don't show badge if empty - cleaner UI
                }
                // ID display: "(id)"
                else if (part === '(id)') {
                    html += `<span class="relation-id">(${$('<div>').text(item.value).html()})</span>`;
                }
            });
        }
        
        // Add main label
        html += `<span class="relation-label-text">${$('<div>').text(item.label).html()}</span>`;
        
        return html;
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
            const mode = input.dataset.relationMode || 'inline'; // 'inline' or 'modal';
            
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
                const selectedCount = input.value ? input.value.split(',').filter(v => v).length : 0;
                const badgeClass = selectedCount > 0 ? 'relation-select-badge has-items' : 'relation-select-badge';
                const button = $(`
                    <button type="button" class="btn btn-default relation-select-open-modal">
                        <svg class="relation-select-icon" viewBox="0 0 24 24" width="14" height="14">
                            <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                        </svg>
                        Auswählen
                        <span class="${badgeClass}">${selectedCount}</span>
                    </button>
                `);
                
                const modal = $(`
                    <div class="relation-select-modal">
                        <div class="relation-select-modal-overlay"></div>
                        <div class="relation-select-modal-dialog">
                            <div class="relation-select-modal-header">
                                <h4 class="relation-select-modal-title">Einträge auswählen</h4>
                                <button type="button" class="relation-select-modal-close">
                                    <svg class="relation-select-icon" viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </button>
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
                
                // Hide input and show button
                $(input).hide().after(button);
                
                // Update badge count function
                const updateBadge = function() {
                    const count = input.value ? input.value.split(',').filter(v => v).length : 0;
                    const badge = button.find('.relation-select-badge');
                    badge.text(count);
                    if (count > 0) {
                        badge.addClass('has-items');
                    } else {
                        badge.removeClass('has-items');
                    }
                };
                
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
                
                // Apply selection and update badge
                modal.find('.relation-select-modal-apply').on('click', function() {
                    modal.removeClass('active');
                    $('body').removeClass('relation-select-modal-open');
                    updateBadge();
                });
                
                // ESC key to close
                $(document).on('keydown.relation-select-modal', function(e) {
                    if (e.key === 'Escape' && modal.hasClass('active')) {
                        modal.removeClass('active');
                        $('body').removeClass('relation-select-modal-open');
                    }
                });
                
                // Store updateBadge function for later use
                $(input).data('updateBadge', updateBadge);
                
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
            if (config.displayFields) {
                params.append('display_fields', config.displayFields);
            }
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
                            const escapedValue = $('<div>').text(item.value).html();
                            const formattedLabel = formatLabel(item, config);
                            availableList.append(`
                                <li data-value="${escapedValue}" class="relation-select-item-available" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
                                    ${formattedLabel}
                                    <button type="button" class="btn btn-link add-item" aria-label="Hinzufügen">
                                        <svg class="relation-select-icon" viewBox="0 0 24 24" width="16" height="16">
                                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                    </button>
                                </li>
                            `);
                        }
                    });

                    // Fill selected items
                    selectedValues.forEach(value => {
                        const item = data.find(i => i.value.toString() === value);
                        if (item) {
                            const escapedValue = $('<div>').text(item.value).html();
                            const formattedLabel = formatLabel(item, config);
                            selectedList.append(`
                                <li data-value="${escapedValue}" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
                                    <svg class="relation-select-icon handle" viewBox="0 0 24 24" width="16" height="16" aria-label="Sortieren">
                                        <circle cx="9" cy="5" r="1.5" fill="currentColor"/>
                                        <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                                        <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                                        <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
                                        <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                                        <circle cx="15" cy="19" r="1.5" fill="currentColor"/>
                                    </svg>
                                    ${formattedLabel}
                                    <button type="button" class="btn btn-link remove-item" aria-label="Entfernen">
                                        <svg class="relation-select-icon" viewBox="0 0 24 24" width="16" height="16">
                                            <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
                                        </svg>
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
                            const text = $(this).text().toLowerCase();
                            $(this).toggle(text.includes(search));
                        });
                    });

                    // Add item - Click on entire row OR button
                    widget.on('click', '.relation-select-item-available', function(e) {
                        // Don't trigger if clicking on button directly (button will handle it)
                        if ($(e.target).closest('.add-item').length > 0) {
                            return;
                        }
                        $(this).find('.add-item').click();
                    });
                    
                    widget.on('click', '.add-item', function(e) {
                        e.stopPropagation(); // Prevent double triggering
                        const li = $(this).closest('li');
                        const value = li.data('value');
                        const item = JSON.parse(li.attr('data-item') || '{}');
                        
                        const escapedValue = $('<div>').text(value).html();
                        const formattedLabel = formatLabel(item, config);
                        
                        selectedList.append(`
                            <li data-value="${escapedValue}" data-item='${li.attr('data-item')}'>
                                <svg class="relation-select-icon handle" viewBox="0 0 24 24" width="16" height="16">
                                    <circle cx="9" cy="5" r="1.5" fill="currentColor"/>
                                    <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                                    <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                                    <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
                                    <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                                    <circle cx="15" cy="19" r="1.5" fill="currentColor"/>
                                </svg>
                                ${formattedLabel}
                                <button type="button" class="btn btn-link remove-item">
                                    <svg class="relation-select-icon" viewBox="0 0 24 24" width="16" height="16">
                                        <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
                                    </svg>
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
                        const item = JSON.parse(li.attr('data-item') || '{}');
                        
                        const escapedValue = $('<div>').text(value).html();
                        const formattedLabel = formatLabel(item, config);
                        
                        availableList.append(`
                            <li data-value="${escapedValue}" class="relation-select-item-available" data-item='${li.attr('data-item')}'>
                                ${formattedLabel}
                                <button type="button" class="btn btn-link add-item">
                                    <svg class="relation-select-icon" viewBox="0 0 24 24" width="16" height="16">
                                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg>
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
                        
                        // Update badge in modal mode
                        const updateBadgeFn = $(input).data('updateBadge');
                        if (updateBadgeFn && typeof updateBadgeFn === 'function') {
                            updateBadgeFn();
                        }
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

