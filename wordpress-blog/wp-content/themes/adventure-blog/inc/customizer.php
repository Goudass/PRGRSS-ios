<?php
/**
 * Theme Customizer settings.
 *
 * @package Adventure_Blog
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register customizer settings.
 *
 * @param WP_Customize_Manager $wp_customize Customizer instance.
 */
function adventure_blog_customize_register( $wp_customize ) {
	$wp_customize->add_section(
		'adventure_blog_branding',
		array(
			'title'    => __( 'Blog outdoorowy', 'adventure-blog' ),
			'priority' => 30,
		)
	);

	$wp_customize->add_setting(
		'adventure_blog_name',
		array(
			'default'           => 'Blog',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);

	$wp_customize->add_control(
		'adventure_blog_name',
		array(
			'label'   => __( 'Nazwa bloga (tymczasowa)', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'adventure_hero_title',
		array(
			'default'           => 'Przygoda zaczyna się tu',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);

	$wp_customize->add_control(
		'adventure_hero_title',
		array(
			'label'   => __( 'Nagłówek hero', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'adventure_hero_subtitle',
		array(
			'default'           => 'Trasy rowerowe, górskie wyprawy i projekty outdoorowe.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);

	$wp_customize->add_control(
		'adventure_hero_subtitle',
		array(
			'label'   => __( 'Podtytuł hero', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'textarea',
		)
	);

	$wp_customize->add_setting(
		'adventure_hero_image',
		array(
			'default'           => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80',
			'sanitize_callback' => 'esc_url_raw',
		)
	);

	$wp_customize->add_control(
		'adventure_hero_image',
		array(
			'label'   => __( 'Zdjęcie hero (URL)', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'url',
		)
	);

	$wp_customize->add_setting(
		'adventure_instagram_url',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);

	$wp_customize->add_control(
		'adventure_instagram_url',
		array(
			'label'   => __( 'Instagram URL', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'url',
		)
	);

	$wp_customize->add_setting(
		'adventure_strava_url',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);

	$wp_customize->add_control(
		'adventure_strava_url',
		array(
			'label'   => __( 'Strava URL', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'url',
		)
	);

	$wp_customize->add_setting(
		'adventure_komoot_url',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);

	$wp_customize->add_control(
		'adventure_komoot_url',
		array(
			'label'   => __( 'Komoot URL', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'url',
		)
	);

	$wp_customize->add_setting(
		'adventure_contact_email',
		array(
			'default'           => get_option( 'admin_email' ),
			'sanitize_callback' => 'sanitize_email',
		)
	);

	$wp_customize->add_control(
		'adventure_contact_email',
		array(
			'label'   => __( 'Email kontaktowy (formularz)', 'adventure-blog' ),
			'section' => 'adventure_blog_branding',
			'type'    => 'email',
		)
	);
}
add_action( 'customize_register', 'adventure_blog_customize_register' );

/**
 * Get blog display name.
 *
 * @return string
 */
function adventure_blog_get_name() {
	$name = get_theme_mod( 'adventure_blog_name', 'Blog' );
	return $name ? $name : 'Blog';
}
