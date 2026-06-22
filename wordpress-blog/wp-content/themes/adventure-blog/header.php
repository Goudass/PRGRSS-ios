<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header">
	<div class="container site-header__inner">
		<a class="site-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<img src="<?php echo esc_url( ADVENTURE_BLOG_URI . '/assets/images/logo-placeholder.svg' ); ?>" alt="<?php echo esc_attr( adventure_blog_get_name() ); ?>" class="site-brand__logo" width="160" height="40">
				<span class="site-brand__name"><?php echo esc_html( adventure_blog_get_name() ); ?></span>
			<?php endif; ?>
		</a>

		<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu" aria-label="<?php esc_attr_e( 'Menu', 'adventure-blog' ); ?>">
			<span></span><span></span><span></span>
		</button>

		<nav class="site-nav" id="primary-menu" aria-label="<?php esc_attr_e( 'Menu główne', 'adventure-blog' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'site-nav__list',
					'fallback_cb'    => 'adventure_blog_fallback_menu',
				)
			);
			?>
		</nav>
	</div>
</header>

<main class="site-main">
