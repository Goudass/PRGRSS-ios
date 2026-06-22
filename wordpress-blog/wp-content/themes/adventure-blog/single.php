<?php
/**
 * Single blog post template.
 *
 * @package Adventure_Blog
 */

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<article <?php post_class( 'post-single' ); ?>>
		<section class="page-header reveal">
			<div class="container">
				<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
				<h1><?php the_title(); ?></h1>
			</div>
		</section>
		<div class="container post-single__body reveal">
			<?php if ( has_post_thumbnail() ) : ?>
				<div class="post-single__featured">
					<?php the_post_thumbnail( 'route-hero' ); ?>
				</div>
			<?php endif; ?>
			<div class="post-content">
				<?php the_content(); ?>
			</div>
		</div>
	</article>
	<?php
endwhile;

get_footer();
