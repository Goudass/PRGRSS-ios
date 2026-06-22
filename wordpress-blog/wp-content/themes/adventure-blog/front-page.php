<?php
/**
 * Front page template.
 *
 * @package Adventure_Blog
 */

get_header();

$hero_image = get_theme_mod(
	'adventure_hero_image',
	'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80'
);
$hero_title    = get_theme_mod( 'adventure_hero_title', 'Przygoda zaczyna się tu' );
$hero_subtitle = get_theme_mod( 'adventure_hero_subtitle', 'Trasy rowerowe, górskie wyprawy i projekty outdoorowe.' );
?>

<section class="hero reveal" style="--hero-image: url('<?php echo esc_url( $hero_image ); ?>')">
	<div class="hero__overlay"></div>
	<div class="container hero__content">
		<p class="hero__eyebrow"><?php echo esc_html( adventure_blog_get_name() ); ?></p>
		<h1 class="hero__title"><?php echo esc_html( $hero_title ); ?></h1>
		<p class="hero__subtitle"><?php echo esc_html( $hero_subtitle ); ?></p>
		<div class="hero__actions">
			<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/trasy/' ) ); ?>"><?php esc_html_e( 'Zobacz trasy', 'adventure-blog' ); ?></a>
			<a class="btn btn--ghost" href="<?php echo esc_url( home_url( '/o-mnie/' ) ); ?>"><?php esc_html_e( 'O mnie', 'adventure-blog' ); ?></a>
		</div>
	</div>
</section>

<?php
$sections = array(
	array(
		'title' => __( 'Trasy rowerowe', 'adventure-blog' ),
		'slug'  => 'trasy-rowerowe',
		'link'  => home_url( '/typ-trasy/trasy-rowerowe/' ),
	),
	array(
		'title' => __( 'Tatry', 'adventure-blog' ),
		'slug'  => 'tatry',
		'link'  => home_url( '/typ-trasy/tatry/' ),
	),
	array(
		'title' => __( 'Projekty', 'adventure-blog' ),
		'slug'  => 'projekty',
		'link'  => home_url( '/typ-trasy/projekty/' ),
	),
);

foreach ( $sections as $section ) :
	$query = adventure_blog_get_routes_by_term( $section['slug'], 3 );
	if ( ! $query->have_posts() ) {
		continue;
	}
	?>
	<section class="section reveal">
		<div class="container">
			<div class="section__header">
				<h2><?php echo esc_html( $section['title'] ); ?></h2>
				<a class="section__link" href="<?php echo esc_url( $section['link'] ); ?>"><?php esc_html_e( 'Zobacz wszystkie', 'adventure-blog' ); ?> →</a>
			</div>
			<div class="route-grid">
				<?php
				while ( $query->have_posts() ) :
					$query->the_post();
					get_template_part( 'template-parts/route', 'card' );
				endwhile;
				wp_reset_postdata();
				?>
			</div>
		</div>
	</section>
<?php endforeach; ?>

<section class="section section--news reveal">
	<div class="container">
		<div class="section__header">
			<h2><?php esc_html_e( 'Aktualności', 'adventure-blog' ); ?></h2>
			<a class="section__link" href="<?php echo esc_url( home_url( '/aktualnosci/' ) ); ?>"><?php esc_html_e( 'Więcej wpisów', 'adventure-blog' ); ?> →</a>
		</div>
		<div class="news-grid">
			<?php
			$news = new WP_Query(
				array(
					'post_type'      => 'post',
					'posts_per_page' => 3,
				)
			);
			if ( $news->have_posts() ) :
				while ( $news->have_posts() ) :
					$news->the_post();
					get_template_part( 'template-parts/content', 'card' );
				endwhile;
				wp_reset_postdata();
			else :
				?>
				<p class="empty-state"><?php esc_html_e( 'Brak aktualności. Dodaj pierwszy wpis w panelu WordPress.', 'adventure-blog' ); ?></p>
			<?php endif; ?>
		</div>
	</div>
</section>

<?php
get_footer();
