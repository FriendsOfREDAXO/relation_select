<?php
if (rex::isBackend() && rex_be_controller::getCurrentPage() != 'login') {
    rex_view::addJsFile('https://cdn.jsdelivr.net/npm/choices.js@10.2.0/public/assets/scripts/choices.min.js');
    rex_view::addCssFile('https://cdn.jsdelivr.net/npm/choices.js@10.2.0/public/assets/styles/choices.min.css');
    #rex_view::addJsFile('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js');
    rex_view::addJsFile(rex_url::addonAssets('relation_select', 'relation_select.js'));
    rex_view::addCssFile(rex_url::addonAssets('relation_select', 'relation_select.css'));
}
