<?php
/**
 * Sunu Nataal functions and definitions
 *
 * @package Sunu_Nataal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Enqueue scripts and styles.
 */
function sunu_nataal_scripts() {
	wp_enqueue_style( 'sunu-nataal-style', get_stylesheet_uri(), array(), '1.0.0' );
}
add_action( 'wp_enqueue_scripts', 'sunu_nataal_scripts' );

/**
 * Theme Setup
 */
function sunu_nataal_setup() {
	add_theme_support( 'align-wide' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'html5', array( 'style', 'script' ) );
    add_theme_support( 'custom-logo' );
}
add_action( 'after_setup_theme', 'sunu_nataal_setup' );

/**
 * Load Custom Post Types
 */
require get_template_directory() . '/inc/post-types.php';
