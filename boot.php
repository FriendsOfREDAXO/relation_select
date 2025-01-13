<?php
if (rex::isBackend() && rex_be_controller::getCurrentPage() != 'login') {
    rex_view::addJsFile(rex_url::addonAssets('relation_select', 'relation_select.js'));
    rex_view::addCssFile(rex_url::addonAssets('relation_select', 'relation_select.css'));
}
