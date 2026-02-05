<?php

$addon = rex_addon::get('relation_select');

if (!rex_config::has('relation_select', 'api_token')) {
    $token = bin2hex(random_bytes(32));
    rex_config::set('relation_select', 'api_token', $token);

    $message = '<div class="alert alert-info">';
    $message .= '<p><strong>' . $addon->i18n('install_success') . '</strong></p>';
    $message .= '<p>' . $addon->i18n('install_token_msg') . '</p>';
    $message .= '<div class="input-group">';
    $message .= '<input type="text" class="form-control" id="relation-select-token" value="' . rex_escape($token) . '" readonly>';
    $message .= '<span class="input-group-btn">';
    $message .= '<clipboard-copy for="relation-select-token" class="btn btn-default"><i class="fa fa-clipboard"></i> ' . $addon->i18n('copy_token') . '</clipboard-copy>';
    $message .= '</span>';
    $message .= '</div>';
    $message .= '</div>';

    $addon->setProperty('successmsg', $message);
}
