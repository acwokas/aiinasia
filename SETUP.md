# AIinASIA 2.0 - Setup Guide

This guide covers the configuration steps needed to fully activate your AIinASIA platform.

## Quick Start

1. **Sign up** at `/auth` to create your account
2. **Grant admin role** (see Database & Authentication section below)
3. **Access admin panel** at `/admin` to start creating content
4. **Create articles** at `/editor` with Scout AI assistance

## Analytics & Advertising

### Google Analytics 4 (GA4)

1. Create a GA4 property at [Google Analytics](https://analytics.google.com)
2. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
3. Update `src/components/GoogleAnalytics.tsx`:
   ```typescript
   const GA_MEASUREMENT_ID = "G-YOUR-ACTUAL-ID";
   ```

**Event Tracking**: The platform automatically tracks:
- Page views
- Article views
- Newsletter signups
- Search queries
- Social shares

### Google Ads / AdSense

1. Sign up for [Google AdSense](https://www.google.com/adsense)
2. Get approved for your site
3. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. Update `src/components/GoogleAds.tsx`:
   ```typescript
   const GOOGLE_ADS_CLIENT = "ca-pub-YOUR-ACTUAL-ID";
   ```
5. Create ad units in AdSense dashboard
6. Update ad slot IDs in the same file for each placement

**Ad Placements**:
- Header ad (728×90 / 320×50)
- Sidebar ad (300×600)
- In-article ad (300×250)
- Footer ad (970×90 / 728×90)

## Database & Authentication

### Email Confirmation

✅ **Auto-confirm is now enabled** - Users can sign in immediately without email verification. This is perfect for testing and development.

For production, you may want to:
1. Access your backend (use the "View Backend" button in Lovable)
2. Navigate to Authentication > Providers > Email
3. Toggle "Confirm email" based on your needs

### Create Admin User

1. Sign up via `/auth` page
2. Find your user ID in the backend (auth.users table)
3. Run this SQL to grant admin role:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR-USER-ID', 'admin');
```

### User Roles

The platform supports three roles:
- `admin`: Full access to all features
- `editor`: Can create, edit, and publish content
- `contributor`: Can create and edit own articles (pending review)

## Scout - Your AI Assistant

Scout uses Lovable AI to power all AI features:

**Scout Features**:
- ✅ AI chatbot for visitor queries ("Ask Scout" button)
- ✅ Writing assistant in editor (select text → Scout Assist)
- ✅ Auto-tagging suggestions
- ✅ SEO title & meta description generation
- ✅ Article summarization

**How to Use Scout in Editor**:
1. Select any text in the excerpt or content fields
2. Click "Scout Assist" button
3. Choose: Improve Writing, Make Shorter, or Expand
4. Scout will rewrite the selected text

**Rate Limits**: Free tier includes limited monthly usage. Upgrade in Lovable workspace settings if needed.

## Content Management

### Article Creation Workflow

1. Navigate to `/editor` (or click "Create New Article" in admin)
2. Fill in article details across three tabs:
   - **Content**: Title, excerpt, main content, featured image
   - **SEO**: Meta title, description, focus keyphrase
   - **Settings**: Article type, status, visibility options
3. Use Scout Assist to improve your writing
4. Upload featured images directly (stored in article-images bucket)
5. Set status to "Published" when ready
6. Save article

### Image Upload

✅ **Image upload is enabled**
- Click the upload button next to Featured Image field
- Images are stored securely in Lovable Cloud storage
- Public URLs are generated automatically
- Supported formats: JPG, PNG, WEBP

### URL Redirects

✅ **Redirect manager is available** at `/redirects`
- Add 301 (permanent) or 302 (temporary) redirects
- Preserve SEO value when migrating content
- Manage all redirects from one interface

## Comment System

✅ **Comments are fully functional**
- Visitors can post comments on articles (require moderation)
- Admin/editors approve or reject via `/admin` → Pending Comments tab
- Approved comments display on articles
- Spam protection through approval workflow

## Newsletter

The newsletter system is connected to the database:
- Popup form (appears after 10 seconds)
- Footer signup form
- Admin can view subscribers count in `/admin`

**Future**: Connect to Mailchimp/ConvertKit via webhook (not yet implemented)

## Domain & SEO

### Update Domain References

Replace `https://aiinasia.com` with your actual domain in:

1. `supabase/functions/generate-sitemap/index.ts` (line 16)
2. `src/components/StructuredData.tsx` (various locations)

### Sitemap Access

Your sitemap will be available at:
- `https://yourdomain.com/sitemap.xml` (via edge function)

The sitemap automatically includes:
- All published articles
- Category pages
- Tag pages
- Author pages
- Static pages

### robots.txt

Already configured at `public/robots.txt` with:
- Sitemap reference
- Admin area protection
- Crawl delay settings

## Contact Form

✅ **Contact form is functional**
- Messages are saved to database
- Admin can view messages (requires contact message admin UI - to be added)
- Email notifications can be added via edge function

## Deployment Checklist

Before going live:

- [ ] Configure GA4 Measurement ID
- [ ] Configure Google Ads Publisher ID
- [ ] Update all domain references
- [ ] Create admin user account
- [ ] Test authentication flows
- [ ] Verify newsletter signup works
- [ ] Create first article with Scout
- [ ] Test comment submission and moderation
- [ ] Upload test images
- [ ] Create URL redirects if migrating
- [ ] Review privacy policy, terms, cookie policy
- [ ] Submit sitemap to Google Search Console

## Post-Launch

### Monitor

- GA4 analytics dashboard
- Usage dashboard in Lovable workspace settings
- Comment moderation queue in `/admin`

### Maintain

- Approve comments regularly
- Update categories/tags as needed
- Monitor newsletter subscriber count
- Check for 404 errors and add redirects
- Review Scout AI usage and limits

## Support & Troubleshooting

- **Platform issues**: Check logs in Lovable Cloud dashboard (View Backend button)
- **Scout features**: Review Lovable AI usage and limits in workspace settings
- **Database access**: Use View Backend button to access tables and data
- **General queries**: Refer to Lovable documentation

---

**Platform Stack**:
- Frontend: React + TypeScript + Vite
- Backend: Lovable Cloud
- AI: Lovable AI Gateway (Scout)
- Database: PostgreSQL
- Authentication: Email/Password (auto-confirm enabled)
- Storage: Lovable Cloud Storage (article-images bucket)

### Google Analytics 4 (GA4)

1. Create a GA4 property at [Google Analytics](https://analytics.google.com)
2. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
3. Update `src/components/GoogleAnalytics.tsx`:
   ```typescript
   const GA_MEASUREMENT_ID = "G-YOUR-ACTUAL-ID";
   ```

**Event Tracking**: The platform automatically tracks:
- Page views
- Article views
- Newsletter signups
- Search queries
- Social shares

### Google Ads / AdSense

1. Sign up for [Google AdSense](https://www.google.com/adsense)
2. Get approved for your site
3. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. Update `src/components/GoogleAds.tsx`:
   ```typescript
   const GOOGLE_ADS_CLIENT = "ca-pub-YOUR-ACTUAL-ID";
   ```
5. Create ad units in AdSense dashboard
6. Update ad slot IDs in the same file for each placement

**Ad Placements**:
- Header ad (728×90 / 320×50)
- Sidebar ad (300×600)
- In-article ad (300×250)
- Footer ad (970×90 / 728×90)

## Domain & SEO

### Update Domain References

Replace `https://aiinasia.com` with your actual domain in:

1. `supabase/functions/generate-sitemap/index.ts` (line 16)
2. `src/components/StructuredData.tsx` (various locations)
3. Authentication redirect URLs in Supabase dashboard

### Sitemap Access

Your sitemap will be available at:
- `https://yourdomain.com/sitemap.xml` (via edge function)

The sitemap automatically includes:
- All published articles
- Category pages
- Tag pages
- Author pages
- Static pages

### robots.txt

Already configured at `public/robots.txt` with:
- Sitemap reference
- Admin area protection
- Crawl delay settings

## Database & Authentication

### Create Admin User

1. Sign up via `/auth` page
2. Access your Supabase dashboard
3. Run this SQL to grant admin role:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR-USER-ID', 'admin');
```

Find your user ID in the `auth.users` table.

### User Roles

The platform supports three roles:
- `admin`: Full access to all features
- `editor`: Can create, edit, and publish content
- `contributor`: Can create and edit own articles (pending review)

## Scout - Your AI Assistant

### Lovable AI Integration

Scout uses Lovable AI (pre-configured) to power all AI features.

**Scout Features**:
- AI chatbot for visitor queries ("Ask Scout")
- Writing assistant (improve, shorten, expand)
- Auto-tagging suggestions
- SEO title & meta description generation
- Article summarisation

**Rate Limits**: Free tier includes limited monthly usage. Upgrade in Lovable dashboard if needed.

**Edge Functions**:
- `scout-chat`: Powers the chatbot
- `scout-assistant`: Powers editorial AI tools

## Content Migration

### WordPress Import (Coming Soon)

The migration tools are prepared but article import is currently manual:

1. Export WordPress content as XML
2. Use `/editor` to create articles manually
3. Bulk import tools will be added in future updates

### Manual Content Entry

Use the CMS Editor at `/editor`:
- Block-based editing
- Live preview
- SEO controls with Scout assistance
- Image uploads
- Scheduling
- Categories & tags

## Newsletter

The newsletter system is connected to the database:
- Popup form (appears after 10 seconds)
- Footer signup form
- Admin can view subscribers in `/admin`

**Future**: Connect to Mailchimp/ConvertKit via webhook (not yet implemented)

## Comment System

Comments are enabled with moderation:
- Visitors can post comments (awaiting approval)
- Admin/editors approve or reject via `/admin`
- Spam protection through approval workflow

## Deployment Checklist

Before going live:

- [ ] Configure GA4 Measurement ID
- [ ] Configure Google Ads Publisher ID
- [ ] Update all domain references
- [ ] Create admin user account
- [ ] Test authentication flows
- [ ] Verify newsletter signup works
- [ ] Check article creation workflow with Scout
- [ ] Test comment submission and moderation
- [ ] Review privacy policy, terms, cookie policy
- [ ] Submit sitemap to Google Search Console
- [ ] Set up redirect rules if migrating from another platform

## Post-Launch

### Monitor

- GA4 analytics dashboard
- Supabase usage dashboard
- Lovable AI usage in workspace settings

### Maintain

- Approve comments regularly
- Update categories/tags as needed
- Monitor newsletter subscriber count
- Check for 404 errors and add redirects

## Support

- Platform issues: Check Supabase logs in Lovable Cloud dashboard
- Scout features: Review Lovable AI usage and limits
- General queries: Refer to documentation

---

**Platform Stack**:
- Frontend: React + TypeScript + Vite
- Backend: Lovable Cloud (Supabase)
- AI: Lovable AI Gateway (Scout)
- Hosting: Lovable.dev
- Database: PostgreSQL (Supabase)
- Authentication: Supabase Auth
