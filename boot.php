<?php

use FriendsOfRedaxo\RelationSelect\RelationSelect;

if (rex::isBackend() && 'login' != rex_be_controller::getCurrentPage()) {
    rex_view::addJsFile('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js');
    rex_view::addJsFile(rex_url::addonAssets('relation_select', 'relation_select.js'));
    rex_view::addCssFile(rex_url::addonAssets('relation_select', 'relation_select.css'));

    rex_view::setJsProperty('relation_select', [
        'search_placeholder' => rex_i18n::msg('relation_select_search_placeholder'),
        'selected_items' => rex_i18n::msg('relation_select_selected_items'),
        'error_loading' => rex_i18n::msg('relation_select_error_loading'),
    ]);
}

rex_api_function::register('relation_select', RelationSelect::class);
