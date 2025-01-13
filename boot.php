<?php
if (rex::isBackend() && rex_be_controller::getCurrentPage() != 'login') {
    rex_view::addJsFile('https://cdn.jsdelivr.net/npm/slim-select@2.8.1/dist/slimselect.min.js');
    rex_view::addCssFile('https://cdn.jsdelivr.net/npm/slim-select@2.8.1/dist/slimselect.min.css');
    rex_view::addJsFile(rex_url::addonAssets('relation_select', 'relation_select.js'));
    rex_view::addCssFile(rex_url::addonAssets('relation_select', 'relation_select.css'));
}
