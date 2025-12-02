<?php

$token = rex_config::get('relation_select', 'api_token');

$content = '';

$fragment = new rex_fragment();
$fragment->setVar('title', rex_i18n::msg('relation_select_api_token'), false);
$fragment->setVar('body', '<p>' . rex_i18n::msg('relation_select_token_description') . '</p><input type="text" class="form-control" value="' . $token . '" readonly onclick="this.select();">', false);
$content .= $fragment->parse('core/page/section.php');

echo $content;
