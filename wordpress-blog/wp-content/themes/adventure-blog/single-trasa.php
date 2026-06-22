<?php
/**
 * Single route template.
 *
 * @package Adventure_Blog
 */

get_header();

while ( have_posts() ) :
	the_post();
	$meta     = adventure_blog_get_route_meta( get_the_ID() );
	$gpx_url  = $meta['gpx_id'] ? wp_get_attachment_url( $meta['gpx_id'] ) : '';
	?>
	<article <?php post_class( 'route-single' ); ?>>
		<section class="route-hero reveal" <?php if ( has_post_thumbnail() ) : ?>style="--route-hero-image: url('<?php echo esc_url( get_the_post_thumbnail_url( get_the_ID(), 'route-hero' ) ); ?>')"<?php endif; ?>>
			<div class="route-hero__overlay"></div>
			<div class="container route-hero__content">
				<?php adventure_blog_difficulty_badge( $meta['trudnosc'] ); ?>
				<h1 class="route-hero__title"><?php the_title(); ?></h1>
				<?php adventure_blog_route_stats( $meta ); ?>
			</div>
		</section>

		<div class="container route-single__body">
			<div class="route-content reveal">
				<?php the_content(); ?>
			</div>

			<?php if ( $gpx_url ) : ?>
				<section class="route-map-section reveal" aria-label="<?php esc_attr_e( 'Mapa trasy', 'adventure-blog' ); ?>">
					<div class="section__header section__header--compact">
						<h2><?php esc_html_e( 'Mapa trasy', 'adventure-blog' ); ?></h2>
						<a class="btn btn--small" href="<?php echo esc_url( $gpx_url ); ?>" download><?php esc_html_e( 'Pobierz GPX', 'adventure-blog' ); ?></a>
					</div>
					<div id="route-map" class="route-map" data-gpx-url="<?php echo esc_url( $gpx_url ); ?>"></div>
					<div class="route-elevation">
						<h3><?php esc_html_e( 'Profil przewyższenia', 'adventure-blog' ); ?></h3>
						<canvas id="route-elevation-chart" height="120"></canvas>
					</div>
				</section>
			<?php endif; ?>

			<?php if ( ! empty( $meta['gallery_ids'] ) ) : ?>
				<section class="route-gallery reveal" aria-label="<?php esc_attr_e( 'Galeria zdjęć', 'adventure-blog' ); ?>">
					<h2><?php esc_html_e( 'Galeria', 'adventure-blog' ); ?></h2>
					<div class="swiper route-gallery__swiper">
						<div class="swiper-wrapper">
							<?php foreach ( $meta['gallery_ids'] as $attachment_id ) : ?>
								<div class="swiper-slide">
									<?php echo wp_get_attachment_image( (int) $attachment_id, 'gallery-thumb' ); ?>
								</div>
							<?php endforeach; ?>
						</div>
						<div class="swiper-button-prev"></div>
						<div class="swiper-button-next"></div>
						<div class="swiper-pagination"></div>
					</div>
				</section>
			<?php endif; ?>
		</div>
	</article>

	<section class="section reveal">
		<div class="container">
			<h2><?php esc_html_e( 'Powiązane trasy', 'adventure-blog' ); ?></h2>
			<div class="route-grid">
				<?php
				$terms = wp_get_post_terms( get_the_ID(), 'typ-trasy', array( 'fields' => 'ids' ) );
				$related = new WP_Query(
					array(
						'post_type'      => 'trasa',
						'posts_per_page' => 3,
						'post__not_in'   => array( get_the_ID() ),
						'tax_query'      => ! empty( $terms ) ? array(
							array(
								'taxonomy' => 'typ-trasy',
								'field'    => 'term_id',
								'terms'    => $terms,
							),
						) : array(),
					)
				);
				if ( $related->have_posts() ) :
					while ( $related->have_posts() ) :
						$related->the_post();
						get_template_part( 'template-parts/route', 'card' );
					endwhile;
					wp_reset_postdata();
				endif;
				?>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_footer();
