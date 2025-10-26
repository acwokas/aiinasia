# 🚀 AI in ASIA - Complete Rebuild Blueprint

**CRITICAL CONTEXT**: This is a complete rebuild of a production news site due to catastrophic database corruption. The original database is inaccessible. This blueprint contains ALL instructions to rebuild the site from scratch with existing code and data.

---

## 📋 OVERVIEW

**What You're Rebuilding:**
- Modern AI news publication website
- 2000+ articles with images
- AI-powered features (Scout chatbot, writing assistant, comment generation)
- Newsletter system with automation
- Full authentication & admin dashboard
- Google AdSense & Analytics integration
- SEO optimized with structured data

**Technology Stack:**
- Frontend: React + TypeScript + Vite + TailwindCSS + Shadcn/ui
- Backend: Supabase (Lovable Cloud)
- AI: Lovable AI Gateway (pre-configured)

---

## ⚡ CRITICAL FIRST STEPS

### Step 1: Verify Files Uploaded
You should have received:
1. ✅ This blueprint (MIGRATION_MASTER_BLUEPRINT.md)
2. ✅ Schema SQL file (migration_schema_export.sql)
3. ✅ Articles CSV (ai-in-asia-export2.csv) - ~5-10MB
4. ✅ All source code files from `/src` directory
5. ✅ All edge functions from `/supabase/functions`
6. ✅ Config files (tailwind.config.ts, vite.config.ts, etc.)

**ACTION**: Confirm you can read all these files using `lov-view` before proceeding.

---

## 🗄️ PHASE 1: DATABASE SETUP (30 minutes)

### Task 1.1: Create Database Schema

**Read the schema file:**
```bash
lov-view migration_schema_export.sql
```

**Understand the schema structure:**
- 40+ tables including: articles, authors, categories, tags, comments, newsletter system, user profiles, achievements, etc.
- All tables use UUID primary keys
- Extensive RLS policies for security
- Database functions for automation (trending articles, author counts, user achievements, etc.)
- Triggers for timestamps and cascading updates

**Create migrations in order:**

1. **Enums first** (these are used by tables):
```sql
-- Run migration for all CREATE TYPE statements
-- Include: article_status, article_type_new, newsletter_status, tool_prompt_category, app_role
```

2. **Core tables** (no foreign keys yet):
```sql
-- Run migration for tables: categories, tags, authors, achievements, article_series
```

3. **Main content tables**:
```sql
-- Run migration for: articles, events, newsletter_editions
```

4. **Relationship tables**:
```sql
-- Run migration for: article_categories, article_tags, newsletter_top_stories, etc.
```

5. **User-related tables**:
```sql
-- Run migration for: profiles, user_roles, user_stats, user_achievements, bookmarks, reading_history
```

6. **Storage bucket** (CRITICAL):
```sql
-- Create the article-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true);

-- RLS policies for storage
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'article-images' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);
```

7. **Database functions**:
```sql
-- Run migrations for all CREATE FUNCTION statements
-- Include: has_role, update_trending_articles, award_points, update_streak, etc.
```

8. **Triggers**:
```sql
-- Run migrations for all CREATE TRIGGER statements
```

9. **Views** (if any):
```sql
-- Run migrations for: authors_public view
```

**CRITICAL**: After each migration batch, check for errors before proceeding to next batch.

---

### Task 1.2: Configure Authentication

**Enable auto-confirm for email signups** (REQUIRED):
```typescript
// Use supabase--configure-auth tool
{
  "auto_confirm_email": true,
  "disable_signup": false,
  "external_anonymous_users_enabled": false
}
```

---

### Task 1.3: Set Up Secrets

**Required API Keys** (user will provide):
```
LOVABLE_API_KEY - Already configured by Lovable (DO NOT ASK USER)
RESEND_API_KEY - For newsletter emails (user will provide)
FINNHUB_API_KEY - For stock ticker (user will provide)
```

**ACTION**: Use `secrets--add_secret` tool for RESEND_API_KEY and FINNHUB_API_KEY.

---

## 📦 PHASE 2: IMPORT EXISTING CODE (10 minutes)

### Task 2.1: Copy All Source Files

**The user has uploaded all files from:**
- `/src` directory (components, pages, hooks, contexts, lib, etc.)
- `/supabase/functions` directory (20+ edge functions)
- Config files

**ACTION**: 
1. Read the uploaded files to understand structure
2. Recreate the exact directory structure
3. Copy all files as-is (no modifications needed unless you find obvious errors)

**Key directories to recreate:**
```
src/
  components/
    ui/ (shadcn components)
    admin/ (admin-specific components)
    email/ (email templates)
    newsletter/ (newsletter components)
  pages/ (40+ pages)
  hooks/
  contexts/
  lib/
  integrations/
    supabase/ (DO NOT TOUCH - auto-generated)
  
supabase/
  functions/
    _shared/ (shared utilities)
    [20+ individual edge functions]
```

**CRITICAL FILES** to ensure are present:
- `src/components/GoogleAds.tsx` (AdSense integration)
- `src/components/GoogleAnalytics.tsx` (GA4 tracking)
- `src/contexts/AuthContext.tsx` (authentication)
- `src/App.tsx` (routing)
- `public/ads.txt` (AdSense verification)

---

### Task 2.2: Verify Configuration Files

**Ensure these exist:**
- `tailwind.config.ts` - Custom design system with semantic tokens
- `vite.config.ts` - Build configuration
- `index.html` - Contains meta tags and preconnects

**Key values in index.html:**
- Google AdSense Publisher ID: `ca-pub-4181437297386228`
- Google Analytics ID: `G-M981596ST2`

---

## 📊 PHASE 3: IMPORT DATA (45 minutes)

### Task 3.1: Import Articles

**Read the articles CSV:**
```typescript
lov-view ai-in-asia-export2.csv
```

**Understand the structure:**
- ~2000 articles
- Image URLs already updated to: `https://jcz.vcj.mybluehost.me/.website_ac81a9d6/wp-content/uploads/`
- Contains: title, slug, content (JSON), featured_image_url, published_at, etc.

**Import strategy:**
1. The site already has a bulk import page at `/admin/bulk-import`
2. Use this existing functionality (it's already coded)
3. Import in batches of 100-200 articles at a time
4. Monitor for errors, skip problematic rows

**After import:**
- Verify article count in database
- Check that images display correctly (URLs should work)
- Test a few article pages

---

### Task 3.2: Handle Missing Data

**Authors:**
- Many articles may have NULL author_id
- The bulk import should handle this gracefully
- May need to create a default "AI in ASIA" author if needed

**Categories:**
- Articles should link to primary_category_id
- Verify categories exist in database
- Use existing category mapping logic if available

---

## 🤖 PHASE 4: AI FEATURES SETUP (15 minutes)

### Task 4.1: Verify Edge Functions

**Critical edge functions that must work:**
1. `scout-chat` - AI chatbot for site navigation
2. `scout-assistant` - Writing assistant for editors
3. `generate-article-comments` - Auto-comment generation
4. `generate-tldr-snapshot` - Article summaries
5. `generate-recommendations` - Article recommendations
6. `generate-weekly-newsletter` - Newsletter automation
7. `send-weekly-newsletter` - Newsletter sending

**ACTION**: 
- Verify all edge function files are present
- Check they reference `LOVABLE_API_KEY` correctly
- Most use `google/gemini-2.5-flash` model

---

### Task 4.2: Test AI Integration

**Quick test:**
1. Open the live site
2. Look for Scout chatbot button (bottom right)
3. Test a simple query
4. Verify it responds

**If it fails:**
- Check edge function logs using `supabase--edge-function-logs`
- Verify LOVABLE_API_KEY is configured
- Check for CORS errors

---

## 💬 PHASE 5: REGENERATE COMMENTS (Optional - 30 minutes)

### Task 5.1: Use Bulk Comment Generation

**The site has a page for this:**
- Navigate to `/admin/bulk-comment-generation`
- Click "Generate Comments for All Articles"
- This will create 3 AI-generated comments per article
- Progress will be shown

**Notes:**
- This is optional - articles work without comments
- Can be done later if needed
- Uses rate-limited AI, so may take time

---

## 🎨 PHASE 6: FRONTEND VERIFICATION (15 minutes)

### Task 6.1: Test Critical Pages

**Test these routes:**
- `/` - Homepage (featured articles, categories)
- `/articles` - Article listing
- `/article/[slug]` - Individual article page
- `/category/[slug]` - Category pages
- `/about` - About page
- `/contact` - Contact form
- `/newsletter` - Newsletter archive
- `/admin` - Admin dashboard (requires login)

### Task 6.2: Verify Integrations

**Google AdSense:**
- Ads should show on article pages (production only)
- In dev mode, house ads (Business in a Byte, PromptAndGo) display
- Check ads.txt is accessible at `/ads.txt`

**Google Analytics:**
- GA4 code loads in production
- Page views track on route change
- Custom events fire (article views, newsletter signups)

**Authentication:**
- Sign up flow works
- Login flow works
- Password reset works
- Profile management works

---

## 🚀 PHASE 7: FINAL CHECKS (10 minutes)

### Task 7.1: Admin Features

**Test admin pages:**
- `/admin/bulk-import` - Article import
- `/admin/editor` - Article editor with rich text
- `/admin/newsletter-manager` - Newsletter creation
- `/admin/author-management` - Author management
- `/admin/editors-pick-manager` - Featured articles

### Task 7.2: SEO & Performance

**Verify:**
- Sitemap accessible at `/sitemap.xml`
- RSS feed at Supabase function URL
- Meta tags present on all pages
- Open Graph images configured
- Structured data (JSON-LD) on article pages

### Task 7.3: Newsletter System

**Components:**
- Newsletter signup forms throughout site
- Weekly automation (generates Fridays 6 AM Singapore time)
- Email sending via Resend
- Archive page with past editions
- Engagement tracking

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

**Issue: RLS Policies Blocking Queries**
```sql
-- Check if user has admin role
SELECT has_role(auth.uid(), 'admin');

-- Grant admin role to first user
INSERT INTO user_roles (user_id, role) VALUES ('[user-id]', 'admin');
```

**Issue: Images Not Loading**
- Verify storage bucket is public
- Check image URLs in articles table
- Test direct URL access to Bluehost images

**Issue: AI Features Not Working**
- Check LOVABLE_API_KEY is set
- Review edge function logs
- Verify rate limits not exceeded
- Check 429 errors in browser console

**Issue: Authentication Failing**
- Verify auto_confirm_email is enabled
- Check email redirect URLs
- Review auth policies on profiles table

---

## 📚 KEY ARCHITECTURE NOTES

### Design System
- Uses semantic color tokens in `index.css`
- All colors are HSL format
- Never use direct colors like `text-white`, always use design tokens
- Dark mode supported via `next-themes`

### State Management
- React Query for server state
- Context for auth state
- No Redux or global state management

### API Patterns
- All Supabase calls through `@/integrations/supabase/client`
- Edge functions for server-side logic
- RLS policies for data security
- Service role key used only in edge functions

### Content Structure
- Articles use JSON content blocks (EditorJS style)
- Images stored in Supabase storage (eventually)
- Currently using external Bluehost URLs
- Markdown content parsed with DOMPurify

---

## ✅ SUCCESS CRITERIA

**Phase 1 Complete:**
- ✅ All database tables created
- ✅ RLS policies active
- ✅ Functions and triggers working
- ✅ Storage bucket configured

**Phase 2 Complete:**
- ✅ All source code files copied
- ✅ No TypeScript errors
- ✅ Build succeeds
- ✅ Dev server runs

**Phase 3 Complete:**
- ✅ Articles imported successfully
- ✅ Images display correctly
- ✅ URLs working

**Phase 4 Complete:**
- ✅ Scout chatbot responds
- ✅ Edge functions deploy successfully
- ✅ AI features functional

**Phase 5 Complete:**
- ✅ Comments generated (optional)

**Phase 6 Complete:**
- ✅ All pages render
- ✅ Navigation works
- ✅ AdSense loads (production)
- ✅ Analytics tracks

**Phase 7 Complete:**
- ✅ Admin dashboard functional
- ✅ Newsletter system works
- ✅ SEO elements present

---

## 🎯 FINAL DEPLOYMENT CHECKLIST

**Before going live:**
- [ ] All critical pages tested
- [ ] Authentication working
- [ ] Admin features accessible
- [ ] Newsletter signup functional
- [ ] Google Analytics tracking
- [ ] Google AdSense displaying
- [ ] Sitemap generated
- [ ] RSS feed active
- [ ] Contact form working
- [ ] 404 page configured
- [ ] Redirects set up (if needed)

**Post-launch:**
- [ ] Submit new sitemap to Google Search Console
- [ ] Monitor error logs
- [ ] Check AI rate limits
- [ ] Verify newsletter automation
- [ ] Test mobile responsiveness

---

## 🆘 GETTING HELP

**If you encounter issues:**
1. Check the troubleshooting section above
2. Use `lov-read-console-logs` to check for errors
3. Use `lov-read-network-requests` for API issues
4. Use `supabase--edge-function-logs` for backend issues
5. Use `supabase--linter` for database security checks

**Remember:**
- This is a complete rebuild - expect some minor issues
- Test thoroughly before deploying
- Keep the original data files as backup
- Monitor performance after launch

---

## 📄 APPENDIX: CRITICAL FILE LOCATIONS

**Google AdSense Configuration:**
- Component: `src/components/GoogleAds.tsx`
- Publisher ID: `ca-pub-4181437297386228`
- Verification: `public/ads.txt`

**Google Analytics Configuration:**
- Component: `src/components/GoogleAnalytics.tsx`
- Measurement ID: `G-M981596ST2`

**Authentication:**
- Context: `src/contexts/AuthContext.tsx`
- Auth page: `src/pages/Auth.tsx`
- Protected routes: Check `src/App.tsx`

**Edge Functions:**
- Location: `supabase/functions/`
- Shared utilities: `supabase/functions/_shared/`

**Admin Dashboard:**
- Main: `src/pages/Admin.tsx`
- Bulk Import: `src/pages/BulkImport.tsx`
- Newsletter Manager: `src/pages/NewsletterManager.tsx`

---

## 🎉 YOU'RE READY!

This blueprint contains everything needed to rebuild AI in ASIA from scratch. Follow the phases in order, verify each step, and test thoroughly. The site should be fully operational within 3-4 hours of focused work.

**Good luck! 🚀**

---

*Blueprint created: 2025-01-26*
*Original site: aiinasia.com*
*Migration reason: Database corruption - PGRST002 error*
