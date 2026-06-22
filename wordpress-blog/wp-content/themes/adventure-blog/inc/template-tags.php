<?php
/**
 * Template helper functions.
 *
 * @package Adventure_Blog
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get route meta fields.
 *
 * @param int $post_id Post ID.
 * @return array
 */
function adventure_blog_get_route_meta( $post_id ) {
	$gallery_ids = get_post_meta( $post_id, '_adventure_gallery_ids', true );
	if ( ! is_array( $gallery_ids ) ) {
		$gallery_ids = array();
	}

	return array(
		'trudnosc'      => get_post_meta( $post_id, '_adventure_trudnosc', true ) ?: 'latwa',
		'czas'          => get_post_meta( $post_id, '_adventure_czas', true ) ?: '',
		'dystans'       => get_post_meta( $post_id, '_adventure_dystans', true ) ?: '',
		'przewyzszenie' => get_post_meta( $post_id, '_adventure_przewyzszenie', true ) ?: '',
		'gpx_id'        => (int) get_post_meta( $post_id, '_adventure_gpx_id', true ),
		'gallery_ids'   => $gallery_ids,
	);
}

/**
 * Difficulty label map.
 *
 * @return array
 */
function adventure_blog_difficulty_labels() {
	return array(
		'latwa'   => __( 'Łatwa', 'adventure-blog' ),
		'srednia' => __( 'Średnia', 'adventure-blog' ),
		'trudna'  => __( 'Trudna', 'adventure-blog' ),
	);
}

/**
 * Render difficulty badge.
 *
 * @param string $level Difficulty slug.
 */
function adventure_blog_difficulty_badge( $level ) {
	$labels = adventure_blog_difficulty_labels();
	$label  = isset( $labels[ $level ] ) ? $labels[ $level ] : $labels['latwa'];

	printf(
		'<span class="badge badge--%1$s">%2$s</span>',
		esc_attr( $level ),
		esc_html( $label )
	);
}

/**
 * Render route meta stats row.
 *
 * @param array $meta Route meta.
 */
function adventure_blog_route_stats( $meta ) {
	?>
	<ul class="route-stats">
		<?php if ( ! empty( $meta['czas'] ) ) : ?>
			<li><span class="route-stats__icon" aria-hidden="true">⏱</span><strong><?php esc_html_e( 'Czas', 'adventure-blog' ); ?>:</strong> <?php echo esc_html( $meta['czas'] ); ?></li>
		<?php endif; ?>
		<?php if ( ! empty( $meta['dystans'] ) ) : ?>
			<li><span class="route-stats__icon" aria-hidden="true">📏</span><strong><?php esc_html_e( 'Dystans', 'adventure-blog' ); ?>:</strong> <?php echo esc_html( $meta['dystans'] ); ?></li>
		<?php endif; ?>
		<?php if ( ! empty( $meta['przewyzszenie'] ) ) : ?>
			<li><span class="route-stats__icon" aria-hidden="true">⛰</span><strong><?php esc_html_e( 'Przewyższenie', 'adventure-blog' ); ?>:</strong> <?php echo esc_html( $meta['przewyzszenie'] ); ?></li>
		<?php endif; ?>
		<li><?php adventure_blog_difficulty_badge( $meta['trudnosc'] ); ?></li>
	</ul>
	<?php
}

/**
 * Query routes by taxonomy slug.
 *
 * @param string $term_slug Taxonomy term slug.
 * @param int    $limit     Number of posts.
 * @return WP_Query
 */
function adventure_blog_get_routes_by_term( $term_slug, $limit = 3 ) {
	return new WP_Query(
		array(
			'post_type'      => 'trasa',
			'posts_per_page' => $limit,
			'tax_query'      => array(
				array(
					'taxonomy' => 'typ-trasy',
					'field'    => 'slug',
					'terms'    => $term_slug,
				),
			),
		)
	);
}

/**
 * Social links from customizer.
 *
 * @return array
 */
function adventure_blog_social_links() {
	$links = array();

	$instagram = get_theme_mod( 'adventure_instagram_url', '' );
	if ( $instagram ) {
		$links[] = array(
			'label' => 'Instagram',
			'url'   => $instagram,
		);
	}

	$strava = get_theme_mod( 'adventure_strava_url', '' );
	if ( $strava ) {
		$links[] = array(
			'label' => 'Strava',
			'url'   => $strava,
		);
	}

	$komoot = get_theme_mod( 'adventure_komoot_url', '' );
	if ( $komoot ) {
		$links[] = array(
			'label' => 'Komoot',
			'url'   => $komoot,
		);
	}

	return $links;
}
