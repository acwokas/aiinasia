# Article Migration CSV Guide

## CSV Template Structure

Your CSV file should have the following columns in this exact order:

```csv
title,slug,old_slug,content,excerpt,author,categories,tags,meta_title,meta_description,featured_image_url,featured_image_alt,published_at,article_type
```

## Column Definitions

### Required Fields

| Column | Description | Example | Notes |
|--------|-------------|---------|-------|
| **title** | Article title | "AI Revolution in Asia: 2024 Trends" | Max 200 characters |
| **slug** | New URL slug | "ai-revolution-asia-2024-trends" | Lowercase, hyphens only, no spaces |
| **content** | Article body | See content section below | Plain text or JSON |
| **old_slug** | Original slug from old site | "2024/01/ai-revolution-asia" | Used for redirect mapping |

### Optional Fields

| Column | Description | Example | Default if Empty |
|--------|-------------|---------|------------------|
| **excerpt** | Short summary | "Discover the top AI trends..." | First 160 chars of content |
| **author** | Author name | "John Smith" | Will use existing author or skip |
| **categories** | Comma-separated | "Technology,AI" | No category assigned |
| **tags** | Comma-separated | "machine learning,asia,trends" | No tags |
| **meta_title** | SEO title | "AI Revolution Asia 2024 \| AI in ASIA" | Uses title field |
| **meta_description** | SEO description | "Explore the top AI trends..." | Uses excerpt |
| **featured_image_url** | Image URL | "https://old-site.com/image.jpg" | No image |
| **featured_image_alt** | Image alt text | "AI technology illustration" | Uses title |
| **published_at** | Publish date | "2024-01-15T10:00:00Z" | Current date |
| **article_type** | Type | "article", "event", "review", "podcast" | "article" |

## Content Formatting

### Option 1: Plain Text (Recommended for simple migration)
```csv
title,slug,old_slug,content,excerpt
"Sample Article","sample-article","old-sample","This is paragraph one.

This is paragraph two with a link: https://example.com

This is paragraph three.","Brief excerpt"
```

### Option 2: HTML Content
```csv
title,slug,old_slug,content,excerpt
"Sample Article","sample-article","old-sample","<p>This is paragraph one.</p><p>This is <strong>bold text</strong>.</p><ul><li>List item 1</li><li>List item 2</li></ul>","Brief excerpt"
```

### Option 3: JSON Format (Advanced - for exact control)
```csv
title,slug,old_slug,content,excerpt
"Sample Article","sample-article","old-sample","[{""type"":""paragraph"",""content"":""This is paragraph one.""},{""type"":""heading"",""level"":2,""content"":""Section Title""}]","Brief excerpt"
```

## Special Characters & Escaping

### CSV Rules:
1. **Wrap fields containing commas in quotes**: `"Technology, AI, Machine Learning"`
2. **Escape quotes with double quotes**: `"He said ""Hello"" to everyone"`
3. **Line breaks within content**: Use actual line breaks inside quoted fields
4. **Special characters**: UTF-8 encoding recommended for international characters

## Example Complete CSV

```csv
title,slug,old_slug,content,excerpt,author,categories,tags,meta_title,meta_description,featured_image_url,featured_image_alt,published_at,article_type
"AI Revolution in Asia: 2024 Trends","ai-revolution-asia-2024","2024/01/ai-revolution","The artificial intelligence landscape in Asia is rapidly evolving. 

In 2024, we're seeing unprecedented growth in AI adoption across various sectors. Companies are investing heavily in machine learning capabilities.

Key trends include:
- Increased government support
- Growing startup ecosystem  
- Enterprise AI adoption

The future looks bright for AI in Asia.","Discover the top AI trends shaping Asia in 2024, from government initiatives to enterprise adoption.","Dr. Sarah Chen","Technology,AI,Trends","artificial intelligence,asia,machine learning,2024","AI Revolution in Asia: 2024 Trends | AI in ASIA","Explore the top AI trends transforming Asia in 2024. Learn about government support, startup growth, and enterprise AI adoption across the region.","https://www.aiinasia.com/wp-content/uploads/2024/01/ai-asia-trends.jpg","Futuristic AI technology illustration with Asian motifs","2024-01-15T10:30:00Z","article"
"Singapore AI Summit 2024","singapore-ai-summit-2024","events/singapore-summit-2024","The Singapore AI Summit returns in 2024, bringing together leading AI researchers, industry experts, and policymakers.

This year's theme focuses on responsible AI development and ethical considerations in artificial intelligence deployment.","Join the premier AI conference in Southeast Asia featuring keynote speakers from Google, Microsoft, and leading universities.","Tech Events Team","Events,Singapore","conference,AI summit,singapore,networking","Singapore AI Summit 2024 | AI in ASIA Events","The premier AI conference in Southeast Asia. Connect with AI leaders, learn from experts, and explore cutting-edge AI innovations.","https://www.aiinasia.com/wp-content/uploads/2024/02/singapore-summit.jpg","Singapore AI Summit conference venue","2024-06-15T09:00:00Z","event"
"Review: ChatGPT Enterprise Edition","chatgpt-enterprise-review","reviews/chatgpt-enterprise","We tested ChatGPT Enterprise Edition for three months in a corporate environment. Here's our comprehensive review.

**Pros:**
- Enhanced security features
- Dedicated support
- Unlimited usage

**Cons:**  
- Higher cost
- Learning curve for teams
- Integration challenges

Overall Rating: 4.5/5","Our in-depth review of ChatGPT Enterprise Edition after 3 months of corporate use. Is it worth the investment?","Michael Rodriguez","Reviews,AI Tools","chatgpt,enterprise,review,ai tools","ChatGPT Enterprise Edition Review 2024 | AI in ASIA","Comprehensive review of ChatGPT Enterprise Edition. Learn about features, pricing, pros and cons after 3 months of real-world corporate testing.","https://www.aiinasia.com/wp-content/uploads/2024/03/chatgpt-enterprise.jpg","ChatGPT Enterprise Edition interface screenshot","2024-03-20T14:00:00Z","review"
```

## Exporting from WordPress

### Using WP All Export Plugin (Recommended):

#### Step 1: Install & Setup
1. Install "WP All Export" plugin from WordPress admin
2. Navigate to **All Export > New Export**
3. Select **Specific Post Type** > **Posts**
4. Click **Customize Export File**

#### Step 2: Configure Export Columns (Drag fields in this order)

**Column 1 - title** (Required)
```
{post_title}
```

**Column 2 - slug** (Required)
```
{post_name}
```

**Column 3 - old_slug** (Required - for redirects)
```
{guid}
```
*Alternative if you want just the slug: `{post_name}`*

**Column 4 - content** (Required)
```
{post_content}
```
*Note: This exports raw HTML content*

**Column 5 - excerpt** (Optional but recommended)
```
{post_excerpt[160]}
```
*The [160] limits to 160 characters*

**Column 6 - author** (Optional)
```
{author_display_name}
```
*Alternative: `{author_first_name} {author_last_name}`*

**Column 7 - categories** (Optional)
```
{categories, sep=,}
```
*The sep=, creates comma-separated list*

**Column 8 - tags** (Optional)
```
{tags, sep=,}
```

**Column 9 - meta_title** (Optional - SEO)

For Yoast SEO:
```
{yoast_wpseo_title}
```

For Rank Math:
```
{rank_math_title}
```

For All in One SEO:
```
{_aioseop_title}
```

**Column 10 - meta_description** (Optional - SEO)

For Yoast SEO:
```
{yoast_wpseo_metadesc}
```

For Rank Math:
```
{rank_math_description}
```

For All in One SEO:
```
{_aioseop_description}
```

**Column 11 - featured_image_url** (Optional but recommended)
```
{featured_image_url}
```

**Column 12 - featured_image_alt** (Optional)
```
{featured_image_alt}
```

**Column 13 - published_at** (Optional but recommended)
```
{post_date_gmt}
```
*Use GMT version for consistent timezone handling*

**Column 14 - article_type** (Optional)
```
article
```
*Or use: `{post_format}` if you use post formats*

#### Step 3: Export Settings

1. **File Type**: CSV
2. **Delimiter**: Comma (,)
3. **Encoding**: UTF-8
4. **Include Field Names**: Yes (check this box)
5. **Filter Posts** (if needed):
   - Published posts only: Add rule `Post Status = publish`
   - Date range: Add rule for `Post Date`
   - Specific categories: Add rule for `Category`

#### Step 4: Run Export

1. Click **Continue**
2. Click **Confirm & Run Export**
3. Download the CSV file
4. Open in text editor (NOT Excel) to verify format
5. Check for proper quote escaping and line breaks

#### Common WP All Export Issues & Solutions

**Issue**: Categories/Tags showing as IDs
- **Fix**: Use `{categories}` not `{categories_ids}`

**Issue**: Content has broken line breaks
- **Fix**: In Advanced Options, enable "Preserve line breaks"

**Issue**: Special characters show as ���
- **Fix**: Ensure UTF-8 encoding is selected

**Issue**: Featured images showing as attachment IDs
- **Fix**: Use `{featured_image_url}` not `{featured_image}`

**Issue**: Empty excerpt fields
- **Fix**: Use `{post_excerpt[160]}` or `{post_content[160]}` as fallback

#### Pro Tips

- **Test Export**: Start with 10 posts to verify format before full export
- **Filter Drafts**: Add rule to export only published posts
- **Backup First**: Always backup your WordPress database before exporting
- **Large Sites**: If you have 1000+ posts, export in batches by date range
- **Custom Fields**: Click "Add Field" > "Custom Field" to add any custom post meta

### Using MySQL Query (Advanced):
```sql
SELECT 
    p.post_title as title,
    p.post_name as slug,
    p.post_name as old_slug,
    p.post_content as content,
    p.post_excerpt as excerpt,
    u.display_name as author,
    GROUP_CONCAT(DISTINCT t_cat.name) as categories,
    GROUP_CONCAT(DISTINCT t_tag.name) as tags,
    pm_title.meta_value as meta_title,
    pm_desc.meta_value as meta_description,
    p.post_date as published_at
FROM wp_posts p
LEFT JOIN wp_users u ON p.post_author = u.ID
LEFT JOIN wp_term_relationships tr_cat ON p.ID = tr_cat.object_id
LEFT JOIN wp_term_taxonomy tt_cat ON tr_cat.term_taxonomy_id = tt_cat.term_taxonomy_id AND tt_cat.taxonomy = 'category'
LEFT JOIN wp_terms t_cat ON tt_cat.term_id = t_cat.term_id
LEFT JOIN wp_term_relationships tr_tag ON p.ID = tr_tag.object_id
LEFT JOIN wp_term_taxonomy tt_tag ON tr_tag.term_taxonomy_id = tt_tag.term_taxonomy_id AND tt_tag.taxonomy = 'post_tag'
LEFT JOIN wp_terms t_tag ON tt_tag.term_id = t_tag.term_id
LEFT JOIN wp_postmeta pm_title ON p.ID = pm_title.post_id AND pm_title.meta_key = '_yoast_wpseo_title'
LEFT JOIN wp_postmeta pm_desc ON p.ID = pm_desc.post_id AND pm_desc.meta_key = '_yoast_wpseo_metadesc'
WHERE p.post_type = 'post' 
    AND p.post_status = 'publish'
GROUP BY p.ID
INTO OUTFILE '/tmp/articles_export.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

## Common Issues & Solutions

### Issue 1: Line Breaks in Content
**Problem**: CSV breaks on line breaks in content
**Solution**: Ensure content is wrapped in quotes and preserve line breaks

### Issue 2: Quotes in Content  
**Problem**: Content contains quotes breaking CSV
**Solution**: Escape quotes with double quotes: `"He said ""Hello"""`

### Issue 3: Large Files
**Problem**: CSV file too large for browser upload
**Solution**: Split into multiple files of 100-200 articles each

### Issue 4: Special Characters
**Problem**: Characters display as ���
**Solution**: Save CSV as UTF-8 encoding

### Issue 5: Date Format
**Problem**: Dates not recognized
**Solution**: Use ISO 8601 format: `2024-01-15T10:30:00Z`

## Pre-Migration Checklist

- [ ] All required columns present (title, slug, old_slug, content)
- [ ] Slugs are URL-friendly (lowercase, hyphens only)
- [ ] No duplicate slugs in the file
- [ ] Content properly escaped (quotes, commas)
- [ ] File saved as UTF-8 encoding
- [ ] Test with 10-20 articles first
- [ ] Backup original data
- [ ] Authors exist in new system or create them first
- [ ] Categories mapped to new structure
- [ ] Images URLs accessible

## Testing Your CSV

1. Open CSV in text editor (not Excel) to verify format
2. Check first and last rows are complete
3. Verify no extra commas or quotes
4. Test import with 5 articles first
5. Check imported articles in system
6. Verify URL mappings created correctly
7. Test one redirect

## Need Help?

If you encounter issues:
1. Check the error log in bulk import tool
2. Verify CSV format in text editor
3. Test with minimal data first
4. Check for special characters causing issues