<?php
/**
 * Plugin Name: AI in Asia Content Exporter
 * Description: Export your WordPress posts to CSV format for AI in Asia migration
 * Version: 1.0
 * Author: AI in Asia
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'aiia_exporter_menu');

function aiia_exporter_menu() {
    add_management_page(
        'AI in Asia Exporter',
        'AI in Asia Export',
        'manage_options',
        'aiia-exporter',
        'aiia_exporter_page'
    );
}

// Admin page
function aiia_exporter_page() {
    ?>
    <div class="wrap">
        <h1>AI in Asia Content Exporter</h1>
        <p>Export your WordPress posts to CSV format for migration to AI in Asia.</p>
        
        <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
            <input type="hidden" name="action" value="aiia_export_csv">
            <?php wp_nonce_field('aiia_export_action', 'aiia_export_nonce'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">Post Status</th>
                    <td>
                        <select name="post_status">
                            <option value="publish">Published Only</option>
                            <option value="any">All Statuses</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Number of Posts</th>
                    <td>
                        <input type="number" name="posts_per_page" value="-1" min="-1" />
                        <p class="description">Use -1 for all posts</p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button('Download CSV Export', 'primary', 'submit', false); ?>
        </form>
        
        <hr>
        
        <h2>Export Details</h2>
        <p>The CSV will include the following fields:</p>
        <ul style="list-style: disc; margin-left: 20px;">
            <li>Title, Slug, Old Slug (with date path)</li>
            <li>Content (HTML), Excerpt</li>
            <li>Author name</li>
            <li>Categories and Tags (comma-separated)</li>
            <li>SEO: Meta Title, Meta Description (Yoast compatible)</li>
            <li>Featured Image URL and Alt Text</li>
            <li>Published Date (ISO format)</li>
            <li>Article Type</li>
        </ul>
    </div>
    <?php
}

// Handle export
add_action('admin_post_aiia_export_csv', 'aiia_handle_export');

function aiia_handle_export() {
    // Check permissions and nonce
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized access');
    }
    
    check_admin_referer('aiia_export_action', 'aiia_export_nonce');
    
    // Get parameters
    $post_status = isset($_POST['post_status']) ? sanitize_text_field($_POST['post_status']) : 'publish';
    $posts_per_page = isset($_POST['posts_per_page']) ? intval($_POST['posts_per_page']) : -1;
    
    // Set headers for CSV download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=ai-in-asia-export-' . date('Y-m-d-His') . '.csv');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Create output stream
    $output = fopen('php://output', 'w');
    
    // Write BOM for UTF-8
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
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
    
    // Query posts
    $args = array(
        'post_type' => 'post',
        'post_status' => $post_status,
        'posts_per_page' => $posts_per_page,
        'orderby' => 'date',
        'order' => 'DESC',
        'no_found_rows' => true,
        'update_post_meta_cache' => false,
        'update_post_term_cache' => false,
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
}
