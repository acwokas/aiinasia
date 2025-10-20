<?php
/**
 * WordPress to AI in Asia CSV Exporter
 * 
 * INSTRUCTIONS:
 * 1. Upload this file to your WordPress site root directory (where wp-config.php is)
 * 2. Access it via: https://yoursite.com/wordpress-export-script.php
 * 3. The CSV will download automatically
 * 4. Delete this file after use for security
 */

// Load WordPress
require_once('wp-load.php');

// Check if user is logged in and is admin
if (!is_user_logged_in() || !current_user_can('administrator')) {
    die('You must be logged in as an administrator to use this script.');
}

// Set headers for CSV download
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=ai-in-asia-export-' . date('Y-m-d') . '.csv');

// Create output stream
$output = fopen('php://output', 'w');

// Write CSV header
fputcsv($output, array(
    'title',
    'slug',
    'old_slug',
    'content',
    'excerpt',
    'author',
    'categories',
    'tags',
    'meta_title',
    'meta_description',
    'featured_image_url',
    'featured_image_alt',
    'published_at',
    'article_type'
));

// Query all published posts
$args = array(
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'orderby' => 'date',
    'order' => 'DESC'
);

$posts = get_posts($args);

foreach ($posts as $post) {
    setup_postdata($post);
    
    // Get post data
    $title = $post->post_title;
    $slug = $post->post_name;
    
    // Create old_slug from post date and slug
    $post_date = get_the_date('Y/m', $post->ID);
    $old_slug = $post_date . '/' . $slug;
    
    // Get content - strip shortcodes and clean up
    $content = $post->post_content;
    $content = strip_shortcodes($content);
    
    // Get excerpt
    $excerpt = $post->post_excerpt;
    if (empty($excerpt)) {
        $excerpt = wp_trim_words(strip_tags($content), 30, '...');
    }
    
    // Get author name
    $author_id = $post->post_author;
    $author = get_the_author_meta('display_name', $author_id);
    
    // Get categories
    $categories = get_the_category($post->ID);
    $category_names = array();
    foreach ($categories as $category) {
        $category_names[] = $category->name;
    }
    $categories_str = implode(',', $category_names);
    
    // Get tags
    $tags = get_the_tags($post->ID);
    $tag_names = array();
    if ($tags) {
        foreach ($tags as $tag) {
            $tag_names[] = $tag->name;
        }
    }
    $tags_str = implode(',', $tag_names);
    
    // Get Yoast SEO data if available
    $meta_title = get_post_meta($post->ID, '_yoast_wpseo_title', true);
    if (empty($meta_title)) {
        $meta_title = $title;
    }
    
    $meta_description = get_post_meta($post->ID, '_yoast_wpseo_metadesc', true);
    if (empty($meta_description)) {
        $meta_description = $excerpt;
    }
    
    // Get featured image
    $featured_image_url = '';
    $featured_image_alt = '';
    if (has_post_thumbnail($post->ID)) {
        $featured_image_url = get_the_post_thumbnail_url($post->ID, 'full');
        $featured_image_alt = get_post_meta(get_post_thumbnail_id($post->ID), '_wp_attachment_image_alt', true);
    }
    
    // Get published date in ISO format
    $published_at = get_the_date('c', $post->ID);
    
    // Article type - default to 'article'
    $article_type = 'article';
    
    // Write row to CSV
    fputcsv($output, array(
        $title,
        $slug,
        $old_slug,
        $content,
        $excerpt,
        $author,
        $categories_str,
        $tags_str,
        $meta_title,
        $meta_description,
        $featured_image_url,
        $featured_image_alt,
        $published_at,
        $article_type
    ));
}

wp_reset_postdata();
fclose($output);
exit;
