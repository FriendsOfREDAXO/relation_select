<?php
if (rex::isBackend() && rex_be_controller::getCurrentPage() != 'login') {
    #rex_view::addJsFile('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js');
    rex_view::addJsFile(rex_url::addonAssets('relation_select', 'relation_select.js'));
    rex_view::addCssFile(rex_url::addonAssets('relation_select', 'relation_select.css'));
}
