<?php
/**
 * Adventure Blog theme functions.
 *
 * @package Adventure_Blog
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ADVENTURE_BLOG_VERSION', '1.0.0' );
define( 'ADVENTURE_BLOG_DIR', get_template_directory() );
define( 'ADVENTURE_BLOG_URI', get_template_directory_uri() );

require_once ADVENTURE_BLOG_DIR . '/inc/cpt-trasa.php';
require_once ADVENTURE_BLOG_DIR . '/inc/meta-boxes.php';
require_once ADVENTURE_BLOG_DIR . '/inc/enqueue.php';
require_once ADVENTURE_BLOG_DIR . '/inc/customizer.php';
require_once ADVENTURE_BLOG_DIR . '/inc/contact-form.php';
require_once ADVENTURE_BLOG_DIR . '/inc/template-tags.php';
require_once ADVENTURE_BLOG_DIR . '/inc/fallback-menu.php';

/**
 * Theme setup.
 */
function adventure_blog_setup() {
	load_theme_textdomain( 'adventure-blog', ADVENTURE_BLOG_DIR . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 80,
			'width'       => 240,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	add_image_size( 'route-card', 640, 400, true );
	add_image_size( 'route-hero', 1920, 1080, true );
	add_image_size( 'gallery-thumb', 800, 600, true );

	register_nav_menus(
		array(
			'primary' => __( 'Menu główne', 'adventure-blog' ),
			'footer'  => __( 'Menu stopki', 'adventure-blog' ),
		)
	);
}
add_action( 'after_setup_theme', 'adventure_blog_setup' );

/**
 * Register widget areas.
 */
function adventure_blog_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Stopka', 'adventure-blog' ),
			'id'            => 'footer-1',
			'before_widget' => '<div class="footer-widget">',
			'after_widget'  => '</div>',
			'before_title'  => '<h3 class="footer-widget__title">',
			'after_title'   => '</h3>',
		)
	);
}
add_action( 'widgets_init', 'adventure_blog_widgets_init' );

/**
 * Flush rewrite rules on theme activation.
 */
function adventure_blog_activation() {
	adventure_blog_register_trasa_cpt();
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'adventure_blog_activation' );
