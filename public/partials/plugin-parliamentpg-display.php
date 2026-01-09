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

<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<div id="parliament-pg-root"
    class="parliament-pg-root elementor-widget-container"
    data-view="<?php if ( isset( $view ) ) {
        echo $view;
    } ?>" data-id="<?php if ( isset( $id ) ) {
        echo $id;
    } ?>" data-wpUrl="<?php if ( isset( $frontend_url ) ) {
    echo $frontend_url;
} ?>"
>
    <!--    React-based HTML will go here-->
</div>