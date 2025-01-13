<?php
if (rex::isBackend() && rex_be_controller::getCurrentPage() != 'login') {
    rex_view::addJsFile('https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/js/tom-select.complete.min.js');
    rex_view::addCssFile('https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/css/tom-select.default.min.css');
    rex_view::addJsFile(rex_url::addonAssets('relation_select', 'relation_select.js'));
    rex_view::addCssFile(rex_url::addonAssets('relation_select', 'relation_select.css'));
}
