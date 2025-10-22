import React from 'react';

interface NewsletterTemplateProps {
  edition: {
    edition_date: string;
    editor_note?: string;
    mini_case_study?: string;
    meme_image_url?: string;
    meme_caption?: string;
    comments_count_override?: number;
  };
  subscriber: {
    first_name?: string;
    email: string;
  };
  heroArticle: {
    id: string;
    title: string;
    excerpt?: string;
    featured_image_url?: string;
    slug: string;
  };
  topStories: Array<{
    id: string;
    title: string;
    excerpt?: string;
    featured_image_url?: string;
    slug: string;
  }>;
  voicesArticle?: {
    id: string;
    title: string;
    excerpt?: string;
    featured_image_url?: string;
    slug: string;
  };
  toolOrPrompt?: {
    title: string;
    description: string;
    url: string;
    category: string;
  };
  quickTakes: Array<{
    headline: string;
    insight: string;
    source_url?: string;
  }>;
  mysteryLink?: {
    title: string;
    url: string;
    description?: string;
  };
  funFact?: {
    fact_text: string;
    source?: string;
  };
  communityMetrics: {
    articles_read: number;
    points_earned: number;
    comments_made: number;
  };
  sponsor?: {
    name: string;
    banner_image_url?: string;
    website_url: string;
    cta_text: string;
  };
  trackingId: string;
  baseUrl: string;
}

export function NewsletterTemplate({
  edition,
  subscriber,
  heroArticle,
  topStories,
  voicesArticle,
  toolOrPrompt,
  quickTakes,
  mysteryLink,
  funFact,
  communityMetrics,
  sponsor,
  trackingId,
  baseUrl,
}: NewsletterTemplateProps) {
  const greeting = subscriber.first_name ? `Hi ${subscriber.first_name}!` : 'Hi there!';
  const editionDate = new Date(edition.edition_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>AI in Asia Newsletter - ${editionDate}</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #ffffff;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
      border-radius: 10px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #ffffff;
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-size: 14px;
    }
    
    .view-online {
      text-align: center;
      margin-bottom: 20px;
      font-size: 12px;
    }
    
    .view-online a {
      color: #8B5CF6;
      text-decoration: none;
    }
    
    .greeting {
      font-size: 18px;
      margin-bottom: 25px;
      color: #1a1a1a;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      color: #8B5CF6;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
    }
    
    .editor-note {
      background: #f9fafb;
      padding: 20px;
      border-left: 4px solid #8B5CF6;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .editor-note h3 {
      margin-top: 0;
      color: #1a1a1a;
    }
    
    .hero-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
      background: #ffffff;
    }
    
    .hero-card img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .hero-content {
      padding: 25px;
    }
    
    .hero-content h3 {
      margin-top: 0;
      font-size: 22px;
      color: #1a1a1a;
      line-height: 1.3;
    }
    
    .hero-content p {
      color: #6b7280;
      margin-bottom: 20px;
    }
    
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
      color: #ffffff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    
    .story-item {
      border-bottom: 1px solid #e5e7eb;
      padding: 20px 0;
    }
    
    .story-item:last-child {
      border-bottom: none;
    }
    
    .story-item h4 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    
    .story-item h4 a {
      color: #8B5CF6;
      text-decoration: none;
    }
    
    .story-item h4 a:hover {
      text-decoration: underline;
    }
    
    .story-item p {
      color: #6b7280;
      margin: 0;
      font-size: 14px;
    }
    
    .sponsor-banner {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    
    .sponsor-banner img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    .mystery-box {
      background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      color: #ffffff;
    }
    
    .mystery-box h3 {
      margin-top: 0;
      font-size: 20px;
    }
    
    .fun-fact-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #f59e0b;
    }
    
    .community-pulse {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    
    .metric-item {
      background: rgba(255, 255, 255, 0.5);
      padding: 15px;
      border-radius: 8px;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e40af;
      display: block;
    }
    
    .metric-label {
      font-size: 12px;
      color: #374151;
      margin-top: 5px;
    }
    
    .gamification-box {
      text-align: center;
      margin: 40px 0;
      padding: 25px;
      background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
      border-radius: 12px;
      color: #ffffff;
    }
    
    .gamification-box p {
      margin: 0;
      font-size: 16px;
    }
    
    .gamification-box strong {
      font-size: 20px;
    }
    
    .cta-box {
      background: #f9fafb;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      border: 2px dashed #8B5CF6;
    }
    
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    
    .footer strong {
      color: #1a1a1a;
    }
    
    .footer a {
      color: #8B5CF6;
      text-decoration: none;
    }
    
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1a1a1a;
        color: #e5e7eb;
      }
      
      .greeting, .section-title, .hero-content h3, .story-item h4 a {
        color: #e5e7eb;
      }
      
      .editor-note {
        background: #2d2d2d;
        border-left-color: #8B5CF6;
      }
      
      .hero-card, .story-item {
        background: #2d2d2d;
        border-color: #404040;
      }
      
      .story-item p, .hero-content p {
        color: #9ca3af;
      }
      
      .footer {
        border-top-color: #404040;
        color: #9ca3af;
      }
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <!-- Tracking pixel -->
  <img src="${baseUrl}/functions/v1/track-newsletter-engagement?tid=${trackingId}" width="1" height="1" alt="" style="display:block;" />
  
  <div class="container">
    <!-- View Online Link -->
    <div class="view-online">
      <a href="${baseUrl}/newsletter/archive/${edition.edition_date}">View this email in your browser</a>
    </div>
    
    <!-- Header -->
    <div class="header">
      <h1>🤖 AI in Asia Weekly</h1>
      <p>${editionDate}</p>
    </div>
    
    <!-- Greeting -->
    <p class="greeting">${greeting}</p>
    
    <!-- Editor's Note (if present) -->
    ${edition.editor_note ? `
    <div class="editor-note">
      <h3>📝 Editor's Note</h3>
      <p>${edition.editor_note}</p>
    </div>
    ` : ''}
    
    <!-- Hero Story -->
    <div class="section">
      <h2 class="section-title">🌟 This Week's Hero Story</h2>
      <div class="hero-card">
        ${heroArticle.featured_image_url ? `<img src="${heroArticle.featured_image_url}" alt="${heroArticle.title}" />` : ''}
        <div class="hero-content">
          <h3>${heroArticle.title}</h3>
          <p>${heroArticle.excerpt || 'Discover the latest insights in AI innovation...'}</p>
          <a href="${baseUrl}/functions/v1/track-newsletter-engagement?tid=${trackingId}&aid=${heroArticle.id}&section=hero" class="btn">Read More</a>
        </div>
      </div>
    </div>
    
    <!-- Sponsor Banner (if present) -->
    ${sponsor ? `
    <div class="sponsor-banner">
      <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">SPONSORED</p>
      ${sponsor.banner_image_url ? `<img src="${sponsor.banner_image_url}" alt="${sponsor.name}" />` : ''}
      <p style="margin: 15px 0 10px 0; font-weight: 600;">${sponsor.name}</p>
      <a href="${sponsor.website_url}" class="btn" style="font-size: 14px; padding: 10px 20px;">${sponsor.cta_text}</a>
    </div>
    ` : ''}
    
    <!-- Top Stories -->
    <div class="section">
      <h2 class="section-title">📚 Top Stories This Week</h2>
      ${topStories.map((story, index) => `
      <div class="story-item">
        <h4><a href="${baseUrl}/functions/v1/track-newsletter-engagement?tid=${trackingId}&aid=${story.id}&section=top-${index + 1}">${story.title}</a></h4>
        <p>${story.excerpt || ''}</p>
      </div>
      `).join('')}
    </div>
    
    <!-- Voices Feature (if present) -->
    ${voicesArticle ? `
    <div class="section">
      <h2 class="section-title">💬 From the Voices</h2>
      <div class="story-item">
        <h4><a href="${baseUrl}/functions/v1/track-newsletter-engagement?tid=${trackingId}&aid=${voicesArticle.id}&section=voices">${voicesArticle.title}</a></h4>
        <p>${voicesArticle.excerpt || ''}</p>
      </div>
    </div>
    ` : ''}
    
    <!-- Tool/Prompt of the Week (if present) -->
    ${toolOrPrompt ? `
    <div class="section">
      <h2 class="section-title">🛠️ ${toolOrPrompt.category === 'tool' ? 'Tool' : 'Prompt'} of the Week</h2>
      <div class="hero-card">
        <div class="hero-content">
          <h3>${toolOrPrompt.title}</h3>
          <p>${toolOrPrompt.description}</p>
          <a href="${toolOrPrompt.url}" class="btn">Try It Now</a>
          <p style="font-size: 12px; color: #8B5CF6; margin-top: 10px;">Powered by PromptandGo</p>
        </div>
      </div>
    </div>
    ` : ''}
    
    <!-- Quick Takes -->
    ${quickTakes.length > 0 ? `
    <div class="section">
      <h2 class="section-title">⚡ Quick Takes</h2>
      ${quickTakes.map((take, index) => `
      <div class="story-item">
        <h4>${take.headline}</h4>
        <p style="font-style: italic;">${take.insight}</p>
        ${take.source_url ? `<a href="${take.source_url}" style="font-size: 12px; color: #8B5CF6;">Read more →</a>` : ''}
      </div>
      `).join('')}
    </div>
    ` : ''}
    
    <!-- Mystery Link -->
    ${mysteryLink ? `
    <div class="section">
      <div class="mystery-box">
        <h3>🔮 Unlock the Unknown</h3>
        <p style="margin: 15px 0;">${mysteryLink.description || 'Discover something unexpected this week...'}</p>
        <a href="${mysteryLink.url}" class="btn" style="background: rgba(255, 255, 255, 0.2); border: 2px solid #ffffff;">Reveal Mystery Link</a>
      </div>
    </div>
    ` : ''}
    
    <!-- Fun Fact -->
    ${funFact ? `
    <div class="section">
      <div class="fun-fact-box">
        <h3 style="margin-top: 0; color: #92400e;">💡 AI Fun Fact</h3>
        <p style="color: #78350f; margin: 0;">${funFact.fact_text}</p>
        ${funFact.source ? `<p style="font-size: 12px; color: #a16207; margin-top: 10px;">Source: ${funFact.source}</p>` : ''}
      </div>
    </div>
    ` : ''}
    
    <!-- Community Pulse -->
    <div class="section">
      <div class="community-pulse">
        <h2 style="margin-top: 0; color: #1e40af;">📊 Community Pulse</h2>
        <p style="color: #374151;">Here's what our amazing community achieved last week:</p>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-value">${communityMetrics.articles_read.toLocaleString()}</span>
            <span class="metric-label">Articles Read</span>
          </div>
          <div class="metric-item">
            <span class="metric-value">${communityMetrics.points_earned.toLocaleString()}</span>
            <span class="metric-label">Points Earned</span>
          </div>
          <div class="metric-item">
            <span class="metric-value">${communityMetrics.comments_made.toLocaleString()}</span>
            <span class="metric-label">Comments Made</span>
          </div>
        </div>
        <p style="color: #1e40af; font-weight: 600; margin-top: 20px; margin-bottom: 0;">Keep earning — your reading and sharing help you climb the leaderboard! 🚀</p>
      </div>
    </div>
    
    <!-- Gamification Callout -->
    <div class="gamification-box">
      <p>💪 Opening this email earned you <strong>+5 points</strong>!</p>
      <p style="margin-top: 10px;">Click any article to earn <strong>+2 more points</strong> each.</p>
      <p style="margin-top: 10px; font-size: 14px;">Click 3+ articles for a <strong>+10 point bonus</strong>! 🎯</p>
    </div>
    
    <!-- Mini Case Study (if present) -->
    ${edition.mini_case_study ? `
    <div class="section">
      <h2 class="section-title">📖 Mini Case Study</h2>
      <div class="editor-note">
        <p>${edition.mini_case_study}</p>
      </div>
    </div>
    ` : ''}
    
    <!-- AI Meme (if present) -->
    ${edition.meme_image_url ? `
    <div class="section">
      <h2 class="section-title">😄 AI Meme Corner</h2>
      <div class="hero-card">
        <img src="${edition.meme_image_url}" alt="${edition.meme_caption || 'AI Meme'}" />
        ${edition.meme_caption ? `<div class="hero-content"><p style="text-align: center; font-style: italic;">${edition.meme_caption}</p></div>` : ''}
      </div>
    </div>
    ` : ''}
    
    <!-- Submit Your Own CTA -->
    <div class="section">
      <div class="cta-box">
        <h3 style="color: #8B5CF6; margin-top: 0;">📝 Got a Story to Share?</h3>
        <p style="color: #374151;">Have an AI insight, success story, or funny moment? We'd love to feature you in next week's newsletter!</p>
        <a href="mailto:contact@aiinasia.com?subject=AI%20in%20Asia%20Newsletter%20Contribution" class="btn">Submit Your Item</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Part of the You.WithThePowerOf.AI Collective</strong></p>
      <p style="margin: 10px 0;">#DemocratisingAI to empower everyone to explore, learn, and create with AI.</p>
      <p style="margin-top: 25px;">
        <a href="${baseUrl}/newsletter">Manage Preferences</a> | 
        <a href="${baseUrl}/functions/v1/track-newsletter-engagement?tid=${trackingId}&action=unsubscribe">Unsubscribe</a>
      </p>
      <p style="margin-top: 15px; color: #9ca3af;">
        AI in Asia | Democratising AI across Asia-Pacific
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export default NewsletterTemplate;
