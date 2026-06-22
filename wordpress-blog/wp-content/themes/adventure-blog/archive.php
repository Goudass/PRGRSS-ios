<?php
/**
 * Archive template for routes and posts.
 *
 * @package Adventure_Blog
 */

get_header();
?>

<section class="page-header reveal">
	<div class="container">
		<h1><?php the_archive_title(); ?></h1>
		<?php if ( get_the_archive_description() ) : ?>
			<p><?php the_archive_description(); ?></p>
		<?php endif; ?>
	</div>
</section>

<section class="section">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<div class="<?php echo is_post_type_archive( 'trasa' ) || is_tax( 'typ-trasy' ) ? 'route-grid' : 'news-grid'; ?>">
				<?php
				while ( have_posts() ) :
					the_post();
					if ( 'trasa' === get_post_type() ) {
						get_template_part( 'template-parts/route', 'card' );
					} else {
						get_template_part( 'template-parts/content', 'card' );
					}
				endwhile;
				?>
			</div>
			<div class="pagination">
				<?php the_posts_pagination(); ?>
			</div>
		<?php else : ?>
			<p class="empty-state"><?php esc_html_e( 'Brak wpisów do wyświetlenia.', 'adventure-blog' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<?php
get_footer();
