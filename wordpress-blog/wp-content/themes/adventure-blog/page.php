<?php
/**
 * Default page template.
 *
 * @package Adventure_Blog
 */

get_header();

while ( have_posts() ) :
	the_post();
	$slug = get_post_field( 'post_name', get_the_ID() );
	?>
	<section class="page-header reveal">
		<div class="container">
			<h1><?php the_title(); ?></h1>
		</div>
	</section>

	<section class="section">
		<div class="container page-content reveal">
			<?php if ( 'kontakt' === $slug ) : ?>
				<div class="contact-layout">
					<div class="contact-layout__info">
						<?php the_content(); ?>
						<div class="contact-social">
							<?php foreach ( adventure_blog_social_links() as $link ) : ?>
								<a href="<?php echo esc_url( $link['url'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $link['label'] ); ?></a>
							<?php endforeach; ?>
						</div>
					</div>
					<div class="contact-layout__form">
						<?php adventure_blog_contact_notice(); ?>
						<form class="contact-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<input type="hidden" name="action" value="adventure_contact">
							<?php wp_nonce_field( 'adventure_contact_form', 'adventure_contact_nonce' ); ?>
							<label>
								<?php esc_html_e( 'Imię', 'adventure-blog' ); ?>
								<input type="text" name="contact_name" required>
							</label>
							<label>
								<?php esc_html_e( 'Email', 'adventure-blog' ); ?>
								<input type="email" name="contact_email" required>
							</label>
							<label>
								<?php esc_html_e( 'Wiadomość', 'adventure-blog' ); ?>
								<textarea name="contact_message" rows="6" required></textarea>
							</label>
							<button type="submit" class="btn btn--primary"><?php esc_html_e( 'Wyślij wiadomość', 'adventure-blog' ); ?></button>
						</form>
					</div>
				</div>
			<?php else : ?>
				<?php the_content(); ?>
			<?php endif; ?>
		</div>
	</section>
	<?php
endwhile;

get_footer();
