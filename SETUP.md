# AIinASIA 2.0 - Setup Guide

This guide covers the configuration steps needed to fully activate your AIinASIA platform.

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
