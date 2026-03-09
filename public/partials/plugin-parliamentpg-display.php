<?php

/**
 * Provide a public-facing view for the plugin
 *
 * This file is used to mark up the public-facing aspects of the plugin.
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    Parliament_PG
 * @subpackage Plugin_Name/public/partials
 */
?>

<div class="parliament-pg-root"
     data-view="<?php if ( isset( $view ) ) {
         echo esc_attr($view);
     } ?>"
     data-id="<?php if ( isset( $id ) ) {
         echo esc_attr($id);
     } ?>"
     data-wpurl="<?php if ( isset( $frontend_url ) ) {
         echo esc_attr($frontend_url);
     } ?>">
</div>