</main>

<footer class="site-footer">
	<div class="container site-footer__inner">
		<div class="site-footer__brand">
			<span class="site-footer__name"><?php echo esc_html( adventure_blog_get_name() ); ?></span>
			<p><?php esc_html_e( 'Blog dla osób aktywnych szukających przygód.', 'adventure-blog' ); ?></p>
		</div>

		<nav class="site-footer__nav" aria-label="<?php esc_attr_e( 'Menu stopki', 'adventure-blog' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'footer',
					'container'      => false,
					'menu_class'     => 'site-footer__list',
					'fallback_cb'    => 'adventure_blog_fallback_menu',
				)
			);
			?>
		</nav>

		<div class="site-footer__social">
			<?php foreach ( adventure_blog_social_links() as $link ) : ?>
				<a href="<?php echo esc_url( $link['url'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $link['label'] ); ?></a>
			<?php endforeach; ?>
		</div>
	</div>
	<div class="site-footer__copy container">
		<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( adventure_blog_get_name() ); ?>. <?php esc_html_e( 'Wszystkie prawa zastrzeżone.', 'adventure-blog' ); ?></p>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
