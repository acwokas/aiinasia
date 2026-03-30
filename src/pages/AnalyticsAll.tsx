import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Recharts
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

// Icons
import {
  Globe, Info, Lightbulb, TrendingUp, Rocket, ChevronDown, Activity, Users, Zap,
  UserCheck, BookCheck, Route as RouteIcon, UserPlus, Search, Trophy, Newspaper,
  Eye, Heart, MessageSquare, Share2, MousePointer, DollarSign, ExternalLink,
  CircleCheck, Clock, Shield, CircleAlert, MessageCircle, Mail
} from "lucide-react";

// date-fns
import {
  format, parseISO, subDays, differenceInDays, isWithinInterval, eachDayOfInterval,
  addWeeks, endOfWeek, startOfWeek
} from "date-fns";

const TIMEOUT_MS = 10000;
const VISITOR_TRACKING_START = "2026-03-23";

// ============================================================================
// HELPER COMPONENTS & UTILITIES
// ============================================================================

/**
 * LoadingSkeleton - Displays loading skeleton for sections
 */
export const LoadingSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-[200px] w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * PlaceholderCard - Shows pending or coming-soon messages
 */
export const PlaceholderCard = ({
  variant = "pending",
  message,
}: {
  variant?: "pending" | "coming-soon";
  message?: string;
}) => {
  const icon = variant === "coming-soon" ? Globe : Info;
  const Icon = icon;
  const defaultMsg =
    variant === "coming-soon"
      ? "Integration coming soon"
      : "Custom tracking events will populate within 24–48 hours";

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message ?? defaultMsg}</span>
    </div>
  );
};

/**
 * InsightsCard - Displays insights/recommendations with styling
 */
const insightIconMap = {
  tip: Lightbulb,
  highlight: TrendingUp,
  warning: CircleAlert,
  action: Rocket,
};

export const InsightsCard = ({
  insights,
  variant = "tip",
}: {
  insights: string[];
  variant?: "tip" | "highlight" | "warning" | "action";
}) => {
  if (!insights.length) return null;

  const IconComponent = insightIconMap[variant];

  return (
    <div className="rounded-xl border-2 border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 p-4 mt-6 shadow-sm">
      <div className="flex gap-2.5">
        <IconComponent className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            💡 Recommendations
          </p>
          {insights.map((insight, idx) => (
            <p
              key={idx}
              className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed"
            >
              {insight}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * StatCard - Displays a label and value
 */
export const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center p-2 rounded border">
    <span className="text-sm text-muted-foreground">{label}</span>
    <Badge variant="secondary" className="font-mono">
      {typeof value === "number" ? value.toLocaleString() : value}
    </Badge>
  </div>
);

/**
 * ChartContainer - Wraps recharts with theme-aware CSS variables
 */
export const ChartContainer = ({
  id,
  className,
  children,
  config,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  config?: Record<string, { label: string; color: string }>;
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export const ChartTooltipContent = () => {
  return <div className="rounded bg-background px-2 py-1.5 text-xs text-foreground" />;
};

/**
 * SectionCard - Wrapper for collapsible sections with white background styling
 */
interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children: React.ReactNode;
}

const SectionCard = ({
  title,
  icon: Icon,
  iconColor,
  children,
}: SectionCardProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white border-gray-200 shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${iconColor}`} />
                <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ErrorBoundary title={title}>
              {children}
            </ErrorBoundary>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

/**
 * ErrorBoundary - Catches component errors
 */
interface ErrorBoundaryProps {
  title: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error) {
    console.error(`[AnalyticsHub] "${this.props.title}" crashed:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
          <p className="font-medium text-red-700">⚠ "{this.props.title}" failed to render</p>
          <p className="text-xs text-red-600 mt-1">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * useSessionStats - Hook for fetching session analytics
 */
interface SessionStats {
  totalSessions: number;
  uniqueVisitors: number;
  avgEngagement: number;
}

const useSessionStats = (startDate: string, range: string) => {
  return useQuery({
    queryKey: ["analytics-hub-session-stats", range],
    queryFn: async () => {
      try {
        const [sessions, visitors, engagement] = await Promise.all([
          supabase.rpc("get_total_sessions", { start_date: startDate }),
          supabase.rpc("get_unique_visitors", { start_date: startDate }),
          supabase.rpc("get_avg_engagement", { start_date: startDate }),
        ]);

        return {
          totalSessions: (sessions.data as number) ?? 0,
          uniqueVisitors: (visitors.data as number) ?? 0,
          avgEngagement: Math.round((engagement.data as number) ?? 0),
        };
      } catch (error) {
        console.error("Session stats error:", error);
        return {
          totalSessions: 0,
          uniqueVisitors: 0,
          avgEngagement: 0,
        };
      }
    },
    staleTime: 60000,
  });
};

/**
 * TopCompletedChart - Renders bar chart + table for top completed articles
 */
function TopCompletedChart({ topCompleted }: { topCompleted: Array<{ name: string; fullName: string; count: number }> }) {
  if (!topCompleted.length) return <p className="text-sm text-gray-500">No completions recorded yet</p>;
  return (
    <>
      <ChartContainer
        config={{
          count: {
            label: "Completions",
            color: "hsl(var(--accent-foreground))",
          },
        }}
        className="h-[250px]"
      >
        <BarChart
          data={topCompleted}
          layout="vertical"
          margin={{ left: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis type="number" className="text-xs" />
          <YAxis
            dataKey="name"
            type="category"
            className="text-xs"
            width={115}
            tick={{ fontSize: 10 }}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>

      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            <TableHead>Article</TableHead>
            <TableHead className="text-right">Completions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topCompleted.map((item) => (
            <TableRow key={item.fullName}>
              <TableCell className="text-xs truncate max-w-[250px]">
                {item.fullName}
              </TableCell>
              <TableCell className="text-right font-medium">
                {item.count.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

// ============================================================================
// SECTION 1: COMPLETIONS
// ============================================================================

export const CompletionsSection = ({
  startDate,
  range,
}: {
  startDate: string;
  range: string;
}) => {
  const { data: result, isLoading } = useQuery({
    queryKey: ["analytics-hub-completions", range],
    queryFn: async () => {
      // Fetch article completion events and guide pageviews
      const [eventsRes, guideRes] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("event_name, event_data, page_path, created_at")
          .in("event_name", [
            "article_complete",
            "article_read_75",
            "article_read_50",
            "article_read_25",
          ])
          .gte("created_at", startDate)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("analytics_pageviews")
          .select("page_path, guide_id, time_on_page_seconds, scroll_depth_percent")
          .not("guide_id", "is", null)
          .gte("viewed_at", startDate)
          .limit(500),
      ]);

      const events = eventsRes.data ?? [];
      const guides = guideRes.data ?? [];

      // Count milestones
      const milestones = {
        article_read_25: events.filter((e) => e.event_name === "article_read_25").length,
        article_read_50: events.filter((e) => e.event_name === "article_read_50").length,
        article_read_75: events.filter((e) => e.event_name === "article_read_75").length,
        article_complete: events.filter((e) => e.event_name === "article_complete").length,
      };

      // Top completed articles
      const completedMap: Record<string, number> = {};
      events
        .filter((e) => e.event_name === "article_complete")
        .forEach((e) => {
          const title =
            e.event_data?.article_title ||
            e.event_data?.title ||
            e.page_path ||
            "unknown";
          completedMap[title] = (completedMap[title] || 0) + 1;
        });

      const topCompleted = Object.entries(completedMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({
          name: name.length > 40 ? name.slice(0, 37) + "…" : name,
          fullName: name,
          count,
        }));

      // Guide metrics
      const avgScroll =
        guides.length > 0
          ? Math.round(
              guides.reduce((sum, g) => sum + (g.scroll_depth_percent ?? 0), 0) /
                guides.length
            )
          : 0;

      const avgTime =
        guides.length > 0
          ? Math.round(
              guides.reduce(
                (sum, g) => sum + Math.min(g.time_on_page_seconds ?? 0, 1800),
                0
              ) / guides.length
            )
          : 0;

      // Completion rate and dropoffs
      const completionRate =
        milestones.article_read_25 > 0
          ? Math.round(
              (milestones.article_complete / milestones.article_read_25) * 100
            )
          : 0;

      const dropoff25to50 =
        milestones.article_read_25 > 0
          ? Math.round(
              ((milestones.article_read_25 - milestones.article_read_50) /
                milestones.article_read_25) *
                100
            )
          : 0;

      const dropoff50to75 =
        milestones.article_read_50 > 0
          ? Math.round(
              ((milestones.article_read_50 - milestones.article_read_75) /
                milestones.article_read_50) *
                100
            )
          : 0;

      return {
        milestones,
        topCompleted,
        avgGuideScroll: avgScroll,
        avgGuideTime: avgTime,
        guideViewCount: guides.length,
        completionRate,
        dropoff25to50,
        dropoff50to75,
        hasData: events.length > 0,
      };
    },
    staleTime: 300000,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!result)
    return <p className="text-sm text-muted-foreground">No data available</p>;

  if (!result.hasData) {
    return (
      <div className="space-y-4">
        <PlaceholderCard message="Article read milestone events (25%, 50%, 75%, complete) will populate within 24–48 hours of tracking setup" />
        <InsightsCard
          insights={[
            "1. No read-depth events recorded yet. Verify the useGA4ContentTracking hook is mounted on Article.tsx — it should fire article_read_25 when scroll depth passes 25%.",
            "2. Once events flow, you'll see a funnel from 25% → 50% → 75% → Complete with drop-off rates at each stage.",
            "3. Industry benchmark: well-structured articles under 1,200 words typically achieve 35-45% completion rates.",
          ]}
        />
      </div>
    );
  }

  const funnelData = [
    { stage: "25%", count: result.milestones.article_read_25 },
    { stage: "50%", count: result.milestones.article_read_50 },
    { stage: "75%", count: result.milestones.article_read_75 },
    { stage: "Complete", count: result.milestones.article_complete },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3">
          Article Read Funnel (completion rate: {result.completionRate}%)
        </h4>
        <ChartContainer
          config={{
            count: { label: "Readers", color: "hsl(var(--primary))" },
          }}
          className="h-[200px]"
        >
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="stage" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Grid: Articles + Guide Engagement */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Top 10 Completed Articles</h4>
          <ArticleTable topCompleted={result.topCompleted} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Guide Engagement</h4>
          {result.guideViewCount > 0 ? (
            <div className="space-y-3">
              <StatCard
                label="Guide Pageviews"
                value={result.guideViewCount}
              />
              <StatCard
                label="Avg Scroll Depth"
                value={`${result.avgGuideScroll}%`}
              />
              <StatCard
                label="Avg Time on Guide"
                value={`${result.avgGuideTime}s`}
              />
            </div>
          ) : (
            <PlaceholderCard
              variant="pending"
              message="No guide pageviews tracked yet. Ensure the useGA4ContentTracking hook is mounted on guide page components."
            />
          )}
        </div>
      </div>

      {/* Insights */}
      <InsightsCard
        insights={(() => {
          const insights: string[] = [];
          const completionRate = result.completionRate;
          const read25 = result.milestones.article_read_25;
          const completed = result.milestones.article_complete;

          // Completion rate insight
          if (read25 > 0 && completionRate < 25) {
            insights.push(
              `1. ${completed.toLocaleString()} of ${read25.toLocaleString()} readers who reach 25% actually finish (${completionRate}% completion — below the 35-45% industry benchmark). The biggest drop-off is 25→50% where ${result.dropoff25to50}% of readers leave. Fix: add a compelling stat, question, or bold claim in the first 2 paragraphs to hook readers past the fold.`
            );
          } else if (completionRate >= 25 && completionRate < 45) {
            insights.push(
              `1. ${completionRate}% completion rate across ${read25.toLocaleString()} readers — approaching the 35-45% industry benchmark. ${result.dropoff50to75}% drop off between 50-75%. Try breaking long-form content into scannable sections with subheadings, pull quotes, or mid-article "Key Takeaway" callouts.`
            );
          } else if (completionRate >= 45) {
            insights.push(
              `1. Excellent ${completionRate}% completion rate — ${completed.toLocaleString()} of ${read25.toLocaleString()} readers finish, well above the 35-45% industry benchmark. Your content structure is working. Document what's different about your top-completing articles and standardise that format.`
            );
          }

          // Top article insight
          const top1 = result.topCompleted[0];
          const top2 = result.topCompleted[1];
          if (top1 && top2 && top2.count > 0) {
            const multiplier = ((top1.count ?? 0) / (top2.count ?? 1)).toFixed(1);
            const title = top1.fullName ?? "Untitled";
            insights.push(
              `2. "${title.length > 50 ? title.slice(0, 47) + "…" : title}" leads with ${(top1.count ?? 0).toLocaleString()} completions (${multiplier}x more than #2). Study what makes it sticky — headline style, topic, length, publish timing — and replicate that formula.`
            );
          } else if (top1) {
            const title = top1.fullName ?? "Untitled";
            insights.push(
              `2. "${title.length > 50 ? title.slice(0, 47) + "…" : title}" leads with ${(top1.count ?? 0).toLocaleString()} completions. Create more content in this topic/format to capitalise on proven reader interest.`
            );
          }

          // Guide insight
          if (result.guideViewCount === 0) {
            insights.push(
              "3. No guide completions tracked yet — verify the useGA4ContentTracking hook is active on guide pages to capture guide_section_view and guide_complete events."
            );
          } else if (result.avgGuideScroll < 40) {
            insights.push(
              `3. Guides average only ${result.avgGuideScroll}% scroll depth across ${result.guideViewCount} views. Add a persistent table of contents sidebar and break guides into shorter, focused steps with clear progress indicators.`
            );
          } else {
            insights.push(
              `3. Guides performing well: ${result.avgGuideScroll}% avg scroll depth, ${result.avgGuideTime}s avg time across ${result.guideViewCount} views.`
            );
          }

          return insights;
        })()}
      />
    </div>
  );
};

// ============================================================================
// SECTION 2: NEW USERS
// ============================================================================

const formatLocaleString = (value: number | string, fallback = "0"): string => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : fallback;
};

export const NewUsersSection = ({
  startDate,
  range,
  totalSessions,
}: {
  startDate: string;
  range: string;
  totalSessions: number;
}) => {
  const { data: result, isLoading } = useQuery({
    queryKey: ["analytics-hub-new-users", range],
    queryFn: async () => {
      // Fetch all sessions with pagination
      const fetchSessions = async () => {
        const allSessions = [];
        let offset = 0;
        const pageSize = 1000;

        while (allSessions.length < 10000) {
          const { data, error } = await supabase
            .from("analytics_sessions")
            .select("started_at")
            .gte("started_at", startDate)
            .order("started_at", { ascending: true })
            .range(offset, offset + pageSize - 1);

          if (error) throw error;

          const rows = data ?? [];
          allSessions.push(...rows);

          if (rows.length < pageSize) break;
          offset += pageSize;
        }

        return allSessions;
      };

      // Fetch landing pages with pagination
      const fetchLandingPages = async () => {
        const allPages = [];
        let offset = 0;
        const pageSize = 1000;

        while (allPages.length < 10000) {
          const { data } = await supabase
            .from("analytics_sessions")
            .select("landing_page")
            .gte("started_at", startDate)
            .not("landing_page", "is", null)
            .range(offset, offset + pageSize - 1);

          const rows = data ?? [];
          allPages.push(...rows);

          if (rows.length < pageSize) break;
          offset += pageSize;
        }

        return allPages;
      };

      const [sessions, pages] = await Promise.all([
        fetchSessions(),
        fetchLandingPages(),
      ]);

      // Group sessions by day
      const sessionsByDay: Record<string, number> = {};
      sessions.forEach((session) => {
        if (!session?.started_at) return;
        const date = parseISO(session.started_at);
        if (!Number.isNaN(date.getTime())) {
          const dateStr = format(date, "yyyy-MM-dd");
          sessionsByDay[dateStr] = (sessionsByDay[dateStr] || 0) + 1;
        }
      });

      // Generate daily data for the date range
      const startDateObj = parseISO(startDate);
      const baseDate =
        !Number.isNaN(startDateObj.getTime())
          ? startDateObj
          : new Date(Date.now() - 7 * 86400000);

      const dailySessions = eachDayOfInterval({
        start: baseDate,
        end: new Date(),
      }).map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return {
          date: format(day, "MMM d"),
          sessions: sessionsByDay[dateStr] || 0,
        };
      });

      // Group landing pages
      const pageMap: Record<string, number> = {};
      pages.forEach((page) => {
        const landing = page?.landing_page || "/";
        if (!landing.includes("__lovable")) {
          pageMap[landing] = (pageMap[landing] || 0) + 1;
        }
      });

      const topEntryPages = Object.entries(pageMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([page, count]) => ({ page, count }));

      // Calculate metrics
      const allCounts = Object.values(sessionsByDay);
      const avgDaily =
        allCounts.length > 0
          ? Math.round(allCounts.reduce((a, b) => a + b, 0) / allCounts.length)
          : 0;

      const recentWeek = dailySessions.slice(-7);
      const priorWeek = dailySessions.slice(-14, -7);

      const recentAvg =
        recentWeek.length > 0
          ? Math.round(
              recentWeek.reduce((sum, d) => sum + d.sessions, 0) / recentWeek.length
            )
          : 0;

      const priorAvg =
        priorWeek.length > 0
          ? Math.round(
              priorWeek.reduce((sum, d) => sum + d.sessions, 0) / priorWeek.length
            )
          : 0;

      const peakDay = dailySessions.reduce(
        (max, day) => (day.sessions > max.sessions ? day : max),
        { date: "", sessions: 0 }
      );

      return {
        dailySessions,
        topEntryPages,
        avgDaily,
        recentAvg,
        priorAvg,
        peakDay,
      };
    },
    staleTime: 60000,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!result)
    return <p className="text-sm text-muted-foreground">No data available</p>;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 max-w-xs">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{formatLocaleString(totalSessions)}</p>
          <p className="text-xs text-muted-foreground">Total Sessions</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{formatLocaleString(result.avgDaily)}</p>
          <p className="text-xs text-muted-foreground">Avg Daily</p>
        </div>
      </div>

      {/* Daily Sessions Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3">Daily Sessions</h4>
        <ChartContainer
          config={{
            sessions: { label: "Sessions", color: "hsl(var(--primary))" },
          }}
          className="h-[220px]"
        >
          <LineChart data={result.dailySessions}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis className="text-xs" />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="sessions"
              fill="hsl(var(--primary) / 0.2)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Top Entry Pages */}
      <div>
        <h4 className="text-sm font-medium mb-3">Top Entry Pages</h4>
        {result.topEntryPages.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.topEntryPages.map((page) => (
                <TableRow key={page.page}>
                  <TableCell className="font-mono text-xs truncate max-w-[300px]">
                    {page.page}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatLocaleString(page.count)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No entry page data</p>
        )}
      </div>

      {/* Insights */}
      <InsightsCard
        insights={(() => {
          const insights: string[] = [];

          if (totalSessions === 0) {
            insights.push("1. No sessions recorded yet. Verify AnalyticsProvider is wrapping your app.");
            insights.push(
              "2. Once tracking is active, you'll see daily session trends and entry page distribution."
            );
            return insights;
          }

          // Trend analysis
          const recent = result.recentAvg;
          const prior = result.priorAvg;

          if (prior > 0 && recent > 0) {
            const changePercent = Math.round(((recent - prior) / prior) * 100);

            if (changePercent > 10) {
              insights.push(
                `1. 📈 Traffic trending up: ${formatLocaleString(recent)} sessions/day this week vs ${formatLocaleString(prior)} last week (+${changePercent}%). Identify what drove the spike and double down.`
              );
            } else if (changePercent < -10) {
              insights.push(
                `1. 📉 Traffic down ${Math.abs(changePercent)}%: ${formatLocaleString(recent)} sessions/day vs ${formatLocaleString(prior)} last week. Check publishing frequency and top entry pages for 404s.`
              );
            } else {
              insights.push(
                `1. Traffic stable at ~${formatLocaleString(recent)} sessions/day (±${Math.abs(changePercent)}% week-over-week).`
              );
            }
          } else {
            const peakNote =
              (result.peakDay?.sessions ?? 0) > result.avgDaily * 1.5
                ? `Peak day was ${result.peakDay?.date ?? "—"} with ${formatLocaleString(result.peakDay?.sessions)} sessions.`
                : "";
            insights.push(
              `1. ${formatLocaleString(totalSessions)} total sessions this period, averaging ${formatLocaleString(result.avgDaily)}/day. ${peakNote}`
            );
          }

          // Top entry page insight
          const topPage = result.topEntryPages[0];
          if (topPage && totalSessions > 0) {
            const percent = Math.round((topPage.count / totalSessions) * 100);
            if (percent > 50) {
              insights.push(
                `2. ⚠️ ${percent}% of all sessions land on "${topPage.page}" — single point of failure. Prioritise SEO on other high-value pages.`
              );
            } else {
              insights.push(
                `2. Top entry page "${topPage.page}" captures ${percent}% of sessions (${formatLocaleString(topPage.count)} visits).`
              );
            }
          }

          // Entry point diversity
          const pageCount = result.topEntryPages.length;
          if (pageCount <= 3 && totalSessions > 100) {
            insights.push(
              `3. Only ${pageCount} entry pages across ${formatLocaleString(totalSessions)} sessions. Invest in long-tail SEO for more entry points.`
            );
          } else if (pageCount >= 8) {
            insights.push(`3. ${pageCount} distinct entry pages — good SEO diversity.`);
          }

          return insights;
        })()}
      />
    </div>
  );
};

// ============================================================================
// SECTION 3: RETURNING USERS
// ============================================================================

export const ReturningUsersSection = ({
  startDate,
  range,
  totalSessions,
  uniqueVisitors,
}: {
  startDate: string;
  range: string;
  totalSessions: number;
  uniqueVisitors: number;
}) => {
  const { data: result, isLoading } = useQuery({
    queryKey: ["analytics-hub-returning", range],
    queryFn: async () => {
      const pageSize = 1000;

      // Fetch pageviews with pagination
      const fetchPageviews = async () => {
        const allPageviews = [];
        let offset = 0;

        while (true) {
          const { data } = await supabase
            .from("analytics_pageviews")
            .select("page_path, session_id")
            .gte("viewed_at", startDate)
            .range(offset, offset + pageSize - 1);

          const rows = data ?? [];
          allPageviews.push(...rows);

          if (rows.length < pageSize) break;
          offset += pageSize;
        }

        return allPageviews;
      };

      // Fetch sessions with pagination
      const fetchSessions = async () => {
        const allSessions = [];
        let offset = 0;

        while (true) {
          const { data } = await supabase
            .from("analytics_sessions")
            .select("visitor_id, started_at")
            .gte("started_at", startDate)
            .not("visitor_id", "is", null)
            .range(offset, offset + pageSize - 1);

          const rows = data ?? [];
          allSessions.push(...rows);

          if (rows.length < pageSize) break;
          offset += pageSize;
        }

        return allSessions;
      };

      // Fetch reading streaks
      const [streaksRes, pageviews, sessions] = await Promise.all([
        supabase
          .from("reading_streaks")
          .select("user_id, current_streak, longest_streak, total_articles_read")
          .order("current_streak", { ascending: false })
          .limit(20),
        fetchPageviews(),
        fetchSessions(),
      ]);

      const streaks = streaksRes.data ?? [];

      // Calculate visitor return rate
      const visitorDays: Record<string, Set<string>> = {};
      sessions.forEach((session) => {
        const visitorId = session?.visitor_id;
        if (!visitorId) return;
        const date = (session.started_at ?? "").slice(0, 10);
        if (date) {
          if (!visitorDays[visitorId]) visitorDays[visitorId] = new Set();
          visitorDays[visitorId].add(date);
        }
      });

      const totalUniqueVisitors = Object.keys(visitorDays).length;
      const returningVisitors = Object.values(visitorDays).filter(
        (days) => days.size >= 2
      ).length;
      const visitorReturnRate =
        totalUniqueVisitors > 0
          ? Math.round((returningVisitors / totalUniqueVisitors) * 100)
          : 0;

      // Calculate bounce rate (single-page sessions)
      const pagesBySession: Record<string, number> = {};
      pageviews.forEach((pv) => {
        const sessionId = pv?.session_id;
        if (sessionId) {
          pagesBySession[sessionId] = (pagesBySession[sessionId] || 0) + 1;
        }
      });

      const sessionIds = Object.keys(pagesBySession);
      const singlePageSessions = sessionIds.filter(
        (id) => pagesBySession[id] === 1
      ).length;
      const bounceRate =
        sessionIds.length > 0
          ? Math.round((singlePageSessions / sessionIds.length) * 100)
          : 0;

      // Calculate avg pages per session
      const totalPageviews = pageviews.length;
      const avgPages =
        sessionIds.length > 0 ? (totalPageviews / sessionIds.length).toFixed(1) : "0";

      // Streak distribution
      const streakBuckets: Record<string, number> = {
        "1d": 0,
        "2-3d": 0,
        "4-7d": 0,
        "8-14d": 0,
        "15-30d": 0,
        "30d+": 0,
      };

      streaks.forEach((streak) => {
        const current = streak?.current_streak ?? 0;
        if (current <= 1) streakBuckets["1d"]++;
        else if (current <= 3) streakBuckets["2-3d"]++;
        else if (current <= 7) streakBuckets["4-7d"]++;
        else if (current <= 14) streakBuckets["8-14d"]++;
        else if (current <= 30) streakBuckets["15-30d"]++;
        else streakBuckets["30d+"]++;
      });

      const streakChartData = Object.entries(streakBuckets).map(([bucket, count]) => ({
        bucket,
        count,
      }));

      // Top revisited pages
      const pageSessionMap: Record<string, Set<string>> = {};
      pageviews.forEach((pv) => {
        const path = pv?.page_path;
        const sessionId = pv?.session_id;
        if (!path || !sessionId || path.includes("__lovable")) return;
        if (!pageSessionMap[path]) pageSessionMap[path] = new Set();
        pageSessionMap[path].add(sessionId);
      });

      const topRevisited = Object.entries(pageSessionMap)
        .map(([path, sessions]) => ({
          path,
          uniqueSessions: sessions.size,
        }))
        .filter((p) => p.uniqueSessions > 1)
        .sort((a, b) => b.uniqueSessions - a.uniqueSessions)
        .slice(0, 8);

      return {
        bounceRate,
        avgPages,
        topStreaks: streaks.slice(0, 8),
        streakChartData,
        topRevisited,
        totalUniqueVisitors,
        returningVisitors,
        visitorReturnRate,
      };
    },
    staleTime: 300000,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!result)
    return <p className="text-sm text-muted-foreground">No data available</p>;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Return Rate (cookie)",
            value:
              result.totalUniqueVisitors > 0
                ? `${result.visitorReturnRate}%`
                : "N/A",
            sub:
              result.totalUniqueVisitors > 0
                ? `${formatLocaleString(result.returningVisitors)} returning / ${formatLocaleString(result.totalUniqueVisitors)} unique visitors`
                : "No visitor_id data yet",
          },
          {
            label: "Bounce Rate",
            value: `${result.bounceRate}%`,
          },
          {
            label: "Avg Pages/Session",
            value: result.avgPages,
            sub:
              parseFloat(result.avgPages) > 10
                ? "High value — may include bot traffic"
                : "Total pageviews ÷ sessions with PV",
          },
          {
            label: "Unique Visitors",
            value: uniqueVisitors,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border p-3 text-center">
            <p className="text-xl font-bold">
              {typeof card.value === "number"
                ? (card.value ?? 0).toLocaleString()
                : card.value}
            </p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
            {"sub" in card && card.sub && (
              <p className="text-[10px] text-muted-foreground">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Tracking notice */}
      <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
        📊 Visitor tracking started {format(new Date(VISITOR_TRACKING_START), "MMM d, yyyy")} —
        return rate will become meaningful after 7+ days of data collection.
      </p>

      {/* Charts and Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Streak Distribution */}
        <div>
          <h4 className="text-sm font-medium mb-3">Streak Distribution</h4>
          <ChartContainer
            config={{
              count: { label: "Users", color: "hsl(var(--primary))" },
            }}
            className="h-[200px]"
          >
            <BarChart data={result.streakChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="bucket" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Top Revisited Pages */}
        <div>
          <h4 className="text-sm font-medium mb-3">Top Revisited Pages</h4>
          {result.topRevisited.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Unique Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.topRevisited.map((page) => (
                  <TableRow key={page.path}>
                    <TableCell className="font-mono text-xs truncate max-w-[200px]">
                      {page.path}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatLocaleString(page.uniqueSessions)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No revisited pages found</p>
          )}
        </div>
      </div>

      {/* Top Reading Streaks */}
      <div>
        <h4 className="text-sm font-medium mb-3">Top Reading Streaks</h4>
        <div className="space-y-2">
          {result.topStreaks.length ? (
            result.topStreaks.map((streak, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm border rounded p-2"
              >
                <Badge
                  variant="outline"
                  className="text-xs w-6 h-6 flex items-center justify-center rounded-full p-0"
                >
                  {idx + 1}
                </Badge>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Current: {streak?.current_streak ?? 0}d</span>
                    <span className="text-muted-foreground">
                      Best: {streak?.longest_streak ?? 0}d
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      ((streak?.current_streak ?? 0) /
                        Math.max(streak?.longest_streak ?? 0, 1)) *
                        100,
                      100
                    )}
                    className="h-1.5"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatLocaleString(streak?.total_articles_read)} read
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No streak data yet</p>
          )}
        </div>
      </div>

      {/* Insights */}
      <InsightsCard
        insights={(() => {
          const insights: string[] = [];
          const returnRate = result.visitorReturnRate;
          const bounceRate = result.bounceRate;

          if (result.totalUniqueVisitors === 0) {
            insights.push(
              "1. No visitor_id data yet. Cookie-based return rate tracking started — results will appear within 24-48 hours."
            );
            insights.push(
              "2. Once data flows, aim for a 20%+ return rate and <50% bounce rate as healthy baselines."
            );
            return insights;
          }

          // Return rate insight
          if (returnRate < 15) {
            insights.push(
              `1. Only ${formatLocaleString(result.returningVisitors)} returning visitors out of ${formatLocaleString(result.totalUniqueVisitors)} (${returnRate}%). Three fixes: (a) add a "Continue Reading" section, (b) enable push notifications, (c) launch a weekly email digest.`
            );
          } else if (returnRate < 30) {
            insights.push(
              `1. ${returnRate}% return rate (${formatLocaleString(result.returningVisitors)} returning visitors) — approaching the 25-30% benchmark. Focus on converting returners to newsletter subscribers.`
            );
          } else {
            insights.push(
              `1. Strong ${returnRate}% return rate with ${formatLocaleString(result.returningVisitors)} returning visitors — above the 25-30% benchmark. Consider a members-only section for loyal readers.`
            );
          }

          // Bounce rate insight
          if (bounceRate > 60) {
            insights.push(
              `2. ⚠️ ${bounceRate}% bounce rate (industry average: 40-60%). Add "Read Next" recommendations at 75% scroll depth and related articles in the sidebar.`
            );
          } else if (bounceRate <= 40) {
            insights.push(
              `2. ${bounceRate}% bounce rate — excellent, well below the 40-60% industry average. Visitors are exploring ${result.avgPages} pages per session.`
            );
          } else {
            insights.push(
              `2. ${bounceRate}% bounce rate — within the 40-60% industry norm. Test adding a "Trending Now" sidebar widget.`
            );
          }

          // Streak insight
          const topStreak = result.topStreaks?.[0]?.longest_streak ?? 0;
          if (topStreak >= 7) {
            insights.push(
              `3. Top reading streak of ${topStreak} days. Reward these readers with exclusive early-access content.`
            );
          } else if (result.totalUniqueVisitors > 50) {
            insights.push(
              `3. Best streak: ${topStreak} days among ${formatLocaleString(result.totalUniqueVisitors)} visitors. Publish on a consistent schedule and add push notification reminders.`
            );
          }

          return insights;
        })()}
      />
    </div>
  );
};



// ============================================================================
// SECTION 5: ContentRankingsSection
// ============================================================================

interface Article {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  trending_score: number;
  article_type: string;
  primary_category_id: string | null;
  published_at: string;
  engagement: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RankingsData {
  articles: Article[];
  categories: Category[];
}

interface ArticleTableProps {
  title: string;
  articles: Article[];
  getCategoryName: (id: string | null) => string;
}

const ArticleTable: React.FC<ArticleTableProps> = ({ title, articles, getCategoryName }) => (
  <div>
    <h4 className="text-sm font-medium mb-3">{title}</h4>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">
            <Eye className="h-3 w-3 inline" />
          </TableHead>
          <TableHead className="text-right">
            <Heart className="h-3 w-3 inline" />
          </TableHead>
          <TableHead className="text-right">
            <MessageSquare className="h-3 w-3 inline" />
          </TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article, idx) => (
          <TableRow key={article.id}>
            <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
            <TableCell className="max-w-[220px] truncate text-xs">{article.title}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-[10px]">
                {getCategoryName(article.primary_category_id)}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono text-xs">
              {(article.view_count ?? 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-mono text-xs">
              {(article.like_count ?? 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-mono text-xs">
              {(article.comment_count ?? 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-mono text-xs font-bold">
              {(article.engagement ?? 0).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export const ContentRankingsSection: React.FC<{ startDate: string; range: string }> = ({ startDate, range }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-hub-rankings", range],
    queryFn: async () => {
      const articles: Article[] = [];
      let offset = 0;

      // Pagination loop: fetch up to 10,000 articles in 1000-row batches
      while (articles.length < 10000) {
        const { data: batch } = await supabase
          .from("articles")
          .select("id, title, slug, view_count, like_count, comment_count, trending_score, article_type, primary_category_id, published_at")
          .eq("status", "published")
          .range(offset, offset + 1000 - 1);

        const batchItems = batch ?? [];
        articles.push(...batchItems);

        if (batchItems.length < 1000) break;
        offset += 1000;
      }

      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("id, name, slug").limit(50);

      return {
        articles: articles.map((a) => ({
          ...a,
          view_count: a.view_count ?? 0,
          like_count: a.like_count ?? 0,
          comment_count: a.comment_count ?? 0,
          engagement: (a.view_count ?? 0) + (a.like_count ?? 0) * 3 + (a.comment_count ?? 0) * 5,
        })),
        categories: categoriesData ?? [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSkeleton className="h-48 w-full" />;
  if (!data) return <p className="text-sm text-muted-foreground">No data available</p>;

  const filtered = selectedCategory === "all" ? data.articles : data.articles.filter((a) => a.primary_category_id === selectedCategory);
  const sorted = [...filtered].sort((a, b) => b.engagement - a.engagement);
  const top10 = sorted.slice(0, 10);
  const bottom10 = sorted.length > 10 ? sorted.slice(-10).reverse() : [];

  const chartData = top10.map((a) => ({
    name: a.title.length > 30 ? a.title.slice(0, 27) + "…" : a.title,
    engagement: a.engagement,
  }));

  const getCategoryName = (id: string | null): string => {
    return id && data.categories.find((c) => c.id === id)?.name || "—";
  };

  const articleCount = filtered.length;
  const avgScore = articleCount > 0 ? Math.round(filtered.reduce((sum, a) => sum + a.engagement, 0) / articleCount) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Category:</span>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {data.categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {(articleCount ?? 0).toLocaleString()} articles · avg score {(avgScore ?? 0).toLocaleString()}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4" /> Top 10 by Engagement Score
        </h4>
        <ChartContainer
          config={{
            engagement: {
              label: "Score",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs" width={135} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ArticleTable title="Top 10" articles={top10} getCategoryName={getCategoryName} />

      {bottom10.length > 0 && <ArticleTable title="Bottom 10" articles={bottom10} getCategoryName={getCategoryName} />}

      <InsightsCard
        insights={(() => {
          const insights: string[] = [];

          if (articleCount === 0) {
            insights.push("1. No published articles yet. Content rankings will populate once articles are published. Create your first article in the Editor to start tracking engagement.");
            insights.push("2. Engagement score = views + (likes × 3) + (comments × 5). Focus on writing content that sparks discussion to maximise scores.");
            return insights;
          }

          const topArticle = top10?.[0];
          const secondArticle = top10?.[1];

          if (topArticle) {
            const title = topArticle.title ?? "Untitled";
            const displayTitle = title.length > 45 ? title.slice(0, 42) + "…" : title;
            const pubDate = topArticle.published_at ? new Date(topArticle.published_at) : null;
            const dayOfWeek = pubDate ? pubDate.toLocaleDateString("en-US", { weekday: "long" }) : null;
            const category = getCategoryName(topArticle.primary_category_id);
            const ratio = secondArticle && (secondArticle.engagement ?? 0) > 0 ? ((topArticle.engagement ?? 0) / (secondArticle.engagement ?? 1)).toFixed(1) : null;

            insights.push(
              `1. #1 article "${displayTitle}" scores ${(topArticle.engagement ?? 0).toLocaleString()} (${(topArticle.view_count ?? 0).toLocaleString()} views, ${(topArticle.like_count ?? 0).toLocaleString()} likes, ${(topArticle.comment_count ?? 0).toLocaleString()} comments)` +
                (category !== "—" ? ` in ${category}` : "") +
                (dayOfWeek ? `, published on a ${dayOfWeek}` : "") +
                (ratio ? `, ${ratio}x more than #2` : "") +
                ". Study what makes it perform — headline style, topic angle, publish timing — and systematically replicate that formula across new content."
            );
          }

          const categoryStats: Record<string, { count: number; totalEng: number }> = {};
          data.articles.forEach((a) => {
            const catName = getCategoryName(a.primary_category_id);
            if (catName !== "—") {
              if (!categoryStats[catName]) {
                categoryStats[catName] = { count: 0, totalEng: 0 };
              }
              categoryStats[catName].count++;
              categoryStats[catName].totalEng += a.engagement;
            }
          });

          const sortedCats = Object.entries(categoryStats).sort((a, b) => b[1].totalEng / b[1].count - a[1].totalEng / a[1].count);
          const topCat = sortedCats[0];
          const bottomCat = sortedCats[sortedCats.length - 1];

          if (topCat && bottomCat && sortedCats.length >= 2) {
            const topAvg = Math.round(topCat[1].totalEng / topCat[1].count);
            const bottomAvg = Math.round(bottomCat[1].totalEng / bottomCat[1].count);
            insights.push(
              `2. "${topCat[0]}" is your strongest category (${(topAvg ?? 0).toLocaleString()} avg engagement across ${topCat[1].count} articles). "${bottomCat[0]}" is weakest (${(bottomAvg ?? 0).toLocaleString()} avg, ${bottomCat[1].count} articles). Consider: publish more in ${topCat[0]}, and for ${bottomCat[0]} either refresh underperforming articles or consolidate thin content into fewer, stronger pieces.`
            );
          } else if (topCat) {
            const topAvg = Math.round(topCat[1].totalEng / topCat[1].count);
            insights.push(
              `2. "${topCat[0]}" leads with ${(topAvg ?? 0).toLocaleString()} avg engagement across ${topCat[1].count} articles. Publish more in this category to capitalise on proven reader interest.`
            );
          }

          if (bottom10.length > 0) {
            const avgViews = Math.round(bottom10.reduce((sum, a) => sum + a.view_count, 0) / bottom10.length);
            if (avgViews < 50) {
              insights.push(
                `3. Bottom 10 articles average only ${(avgViews ?? 0).toLocaleString()} views. Three options: (a) add internal links from your top 10 articles to drive traffic, (b) consolidate thin articles into comprehensive pillar content, (c) set up 301 redirects from dead content to related high-performers.`
              );
            } else {
              const avgEng = Math.round(bottom10.reduce((sum, a) => sum + a.engagement, 0) / bottom10.length);
              insights.push(
                `3. Bottom 10 average ${(avgEng ?? 0).toLocaleString()} engagement (${(avgViews ?? 0).toLocaleString()} views). They're getting traffic but not sparking interaction — add discussion questions at the end, enable comments, or rewrite headlines to set clearer expectations.`
              );
            }
          }

          return insights;
        })()}
      />
    </div>
  );
};

// ============================================================================
// SECTION 6: NavigationSection
// ============================================================================

interface NavigationData {
  clickedElements: Array<{ name: string; fullName: string; count: number }>;
  topPages: Array<{ path: string; views: number; avgTime: number; avgScroll: number }>;
  topReferrers: Array<{ domain: string; count: number }>;
  deviceCounts: Record<string, number>;
  topExits: Array<{ path: string; count: number }>;
  totalNavEvents: number;
  totalPageviews: number;
}

export const NavigationSection: React.FC<{ startDate: string; range: string }> = ({ startDate, range }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-hub-navigation", range],
    queryFn: async () => {
      const internalDomains = ["lovable.app", "lovable.dev", "lovableproject.com", "ai-in-asia.lovable.app", "aiinasia.com", "www.aiinasia.com", "ai-in-asia.com", "www.ai-in-asia.com"];

      // Fetch navigation events
      const fetchNavEvents = async () => {
        const events = [];
        let offset = 0;
        while (events.length < 10000) {
          const { data: batch } = await supabase
            .from("analytics_events")
            .select("event_name, event_data")
            .in("event_name", ["nav_click", "nav_category_click", "cta_click", "search_performed", "social_share_click"])
            .gte("created_at", startDate)
            .range(offset, offset + 1000 - 1);

          const batchItems = batch ?? [];
          events.push(...batchItems);
          if (batchItems.length < 1000) break;
          offset += 1000;
        }
        return events;
      };

      // Fetch pageviews
      const fetchPageviews = async () => {
        const pageviews = [];
        let offset = 0;
        while (pageviews.length < 10000) {
          const { data: batch } = await supabase
            .from("analytics_pageviews")
            .select("page_path, referrer_path, time_on_page_seconds, scroll_depth_percent, is_exit")
            .gte("viewed_at", startDate)
            .range(offset, offset + 1000 - 1);

          const batchItems = batch ?? [];
          pageviews.push(...batchItems);
          if (batchItems.length < 1000) break;
          offset += 1000;
        }
        return pageviews;
      };

      // Fetch sessions
      const fetchSessions = async () => {
        const sessions = [];
        let offset = 0;
        while (sessions.length < 10000) {
          const { data: batch } = await supabase
            .from("analytics_sessions")
            .select("referrer_domain, device_type")
            .gte("started_at", startDate)
            .range(offset, offset + 1000 - 1);

          const batchItems = batch ?? [];
          sessions.push(...batchItems);
          if (batchItems.length < 1000) break;
          offset += 1000;
        }
        return sessions;
      };

      const [navEvents, pageviews, sessions] = await Promise.all([fetchNavEvents(), fetchPageviews(), fetchSessions()]);

      // Process clicked elements
      const elementCounts: Record<string, number> = {};
      navEvents.forEach((evt) => {
        const eventData = evt.event_data;
        const label = eventData?.label || eventData?.element || eventData?.category || eventData?.platform || evt.event_name;
        elementCounts[label] = (elementCounts[label] || 0) + 1;
      });

      const clickedElements = Object.entries(elementCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, count]) => ({
          name: name.length > 25 ? name.slice(0, 22) + "…" : name,
          fullName: name,
          count,
        }));

      // Process top pages
      const pageStats: Record<string, { views: number; avgTime: number; avgScroll: number }> = {};
      pageviews.forEach((pv) => {
        const path = pv.page_path || "/";
        if (!pageStats[path]) {
          pageStats[path] = { views: 0, avgTime: 0, avgScroll: 0 };
        }
        pageStats[path].views++;
        pageStats[path].avgTime += Math.min(pv.time_on_page_seconds ?? 0, 1800);
        pageStats[path].avgScroll += pv.scroll_depth_percent ?? 0;
      });

      const topPages = Object.entries(pageStats)
        .map(([path, stats]) => ({
          path,
          views: stats.views,
          avgTime: stats.views > 0 ? Math.round(stats.avgTime / stats.views) : 0,
          avgScroll: stats.views > 0 ? Math.round(stats.avgScroll / stats.views) : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Process referrers (filter internal)
      const referrerCounts: Record<string, number> = {};
      sessions.forEach((sess) => {
        const domain = sess.referrer_domain || "direct";
        if (!internalDomains.some((d) => domain.includes(d))) {
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
        }
      });

      const topReferrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([domain, count]) => ({ domain, count }));

      // Process devices
      const deviceCounts: Record<string, number> = {};
      sessions.forEach((sess) => {
        const device = sess.device_type || "unknown";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      // Process exit pages
      const exitCounts: Record<string, number> = {};
      pageviews.filter((pv) => !!pv.is_exit).forEach((pv) => {
        const path = pv.page_path || "/";
        exitCounts[path] = (exitCounts[path] || 0) + 1;
      });

      const topExits = Object.entries(exitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count }));

      return {
        clickedElements,
        topPages,
        topReferrers,
        deviceCounts,
        topExits,
        totalNavEvents: navEvents.length,
        totalPageviews: pageviews.length,
      };
    },
    staleTime: 300000,
  });

  if (isLoading) return <LoadingSkeleton className="h-48 w-full" />;
  if (!data) return <p className="text-sm text-muted-foreground">No data available</p>;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">
          Most Clicked Elements ({(data.totalNavEvents ?? 0).toLocaleString()} events)
        </h4>
        {data.clickedElements.length ? (
          <ChartContainer
            config={{
              count: {
                label: "Clicks",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.clickedElements} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={115} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">No navigation events recorded yet</p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">
          Top Pages ({(data.totalPageviews ?? 0).toLocaleString()} pageviews)
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Avg Time</TableHead>
              <TableHead className="text-right">Avg Scroll</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topPages.map((page) => (
              <TableRow key={page.path}>
                <TableCell className="font-mono text-xs truncate max-w-[200px]">{page.path}</TableCell>
                <TableCell className="text-right font-mono text-xs">{(page.views ?? 0).toLocaleString()}</TableCell>
                <TableCell className="text-right text-xs">{(page.avgTime ?? 0).toLocaleString()}s</TableCell>
                <TableCell className="text-right text-xs">{(page.avgScroll ?? 0).toLocaleString()}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Top Referrers</h4>
          <div className="space-y-1.5">
            {data.topReferrers.map((referrer) => (
              <div key={referrer.domain} className="flex justify-between text-xs border rounded p-2">
                <span className="truncate">{referrer.domain}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {(referrer.count ?? 0).toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Devices</h4>
          <div className="space-y-1.5">
            {Object.entries(data.deviceCounts).map(([device, count]) => (
              <div key={device} className="flex justify-between text-xs border rounded p-2">
                <span className="capitalize">{device}</span>
                <Badge variant="outline" className="text-[10px]">
                  {(count ?? 0).toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Top Exit Pages</h4>
          <div className="space-y-1.5">
            {data.topExits.map((exit) => (
              <div key={exit.path} className="flex justify-between text-xs border rounded p-2">
                <span className="font-mono truncate max-w-[140px]">{exit.path}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {(exit.count ?? 0).toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InsightsCard
        insights={(() => {
          const insights: string[] = [];
          const navEvents = data.totalNavEvents;
          const pageviews = data.totalPageviews;

          if (navEvents === 0 && pageviews === 0) {
            insights.push("1. No navigation or pageview events recorded. Ensure useGA4NavigationTracking fires nav_click events on header/footer link clicks and that analytics_pageviews rows are being inserted on each page view.");
            insights.push("2. Once active, this section reveals which nav elements, pages, and exit points shape your user journey.");
            return insights;
          }

          const topElement = data.clickedElements[0];
          if (topElement && navEvents > 0) {
            const pct = Math.round((topElement.count / navEvents) * 100);
            insights.push(
              `1. "${topElement.fullName}" captures ${pct}% of all nav interactions (${(topElement.count ?? 0).toLocaleString()} clicks). This is your most-used navigation element — ensure your highest-priority content (flagship articles, conversion pages) is accessible from this position.`
            );
          }

          const lowScrollPages = data.topPages.filter((p) => p.avgScroll < 30 && p.views > 20);
          if (lowScrollPages.length > 0) {
            const page = lowScrollPages[0];
            insights.push(
              `2. ⚠️ "${page.path}" gets ${(page.views ?? 0).toLocaleString()} views but only ${page.avgScroll}% avg scroll depth. Readers aren't engaging beyond the fold. Restructure: move the key value proposition or most compelling content higher, reduce hero image height, and add a visible "Read more" indicator.`
            );
          } else if (data.topPages.length > 0) {
            const best = data.topPages.reduce((acc, p) => (p.avgScroll > acc.avgScroll ? p : acc), data.topPages[0]);
            insights.push(
              `2. Best scroll depth: "${best.path}" at ${best.avgScroll}% across ${(best.views ?? 0).toLocaleString()} views. Use this page's content structure as a template for other pages.`
            );
          }

          const topExit = data.topExits[0];
          if (topExit && pageviews > 0) {
            const pct = Math.round((topExit.count / pageviews) * 100);
            insights.push(
              `3. Top exit page: "${topExit.path}" accounts for ${(topExit.count ?? 0).toLocaleString()} exits (${pct}% of pageviews). Reduce drop-off by adding a "You might also like" section, a newsletter signup CTA, or a sticky "Next Article" bar at the bottom.`
            );
          }

          return insights;
        })()}
      />
    </div>
  );
};

// ============================================================================
// SECTION 7: CTANewsletterSection
// ============================================================================

interface CTAData {
  ctaViews: number;
  ctaClicks: number;
  ctaConversion: number;
  viewToSubmit: number;
  submissions: number;
  activeSubs: number;
  totalSubs: number;
  newSubs: number;
  unsubscribed: number;
  topCtaPages: Array<{ page: string; count: number }>;
  editions: Array<{ id: string; subject_line: string; total_sent: number; total_opened: number; edition_date: string }>;
  submissionTimeline: Array<{ date: string; submissions: number }>;
  hasCtaEvents: boolean;
  hasEditions: boolean;
  hasSendData: boolean;
  avgOpenRate: number;
}

export const CTANewsletterSection: React.FC<{ startDate: string; range: string }> = ({ startDate, range }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-hub-cta", range],
    queryFn: async () => {
      const [ctaEventsRes, subsRes, editionsRes] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("event_name, event_data, page_path, created_at")
          .in("event_name", ["newsletter_cta_view", "newsletter_cta_click", "newsletter_signup", "newsletter_cta_submit", "cta_click"])
          .gte("created_at", startDate)
          .order("created_at", { ascending: true })
          .limit(500),
        supabase.from("newsletter_subscribers").select("id, subscribed_at, confirmed, unsubscribed_at").limit(1000),
        supabase
          .from("newsletter_editions")
          .select("id, subject_line, total_sent, total_opened, edition_date")
          .eq("status", "sent")
          .order("edition_date", { ascending: false })
          .limit(5),
      ]);

      const ctaEvents = ctaEventsRes.data ?? [];
      const subs = subsRes.data ?? [];
      const editions = editionsRes.data ?? [];

      const ctaViews = ctaEvents.filter((e) => e.event_name === "newsletter_cta_view").length;
      const ctaClicks = ctaEvents.filter((e) => e.event_name === "newsletter_cta_click").length;
      const submissions = ctaEvents.filter((e) => ["newsletter_signup", "newsletter_cta_submit"].includes(e.event_name)).length;
      const ctaConversion = ctaViews > 0 ? Math.round((ctaClicks / ctaViews) * 100) : 0;
      const viewToSubmit = ctaViews > 0 ? Math.round((submissions / ctaViews) * 100) : 0;
      const activeSubs = subs.filter((s) => s.confirmed === true && !s.unsubscribed_at).length;
      const totalSubs = subs.length;
      const unsubscribed = subs.filter((s) => !!s.unsubscribed_at).length;
      const newSubs = subs.filter((s) => s.subscribed_at && s.subscribed_at >= startDate).length;

      const hasCtaEvents = ctaEvents.length > 0;
      const hasEditions = editions.length > 0;
      const hasSendData = editions.some((e) => (e.total_sent ?? 0) > 0);
      const sentEditions = editions.filter((e) => (e.total_sent ?? 0) > 0);
      const avgOpenRate = sentEditions.length > 0
        ? Math.round(sentEditions.reduce((sum, e) => sum + ((e.total_opened ?? 0) / (e.total_sent ?? 1)) * 100, 0) / sentEditions.length)
        : 0;

      // Build submission timeline
      const submissionsByDate: Record<string, number> = {};
      ctaEvents
        .filter((e) => ["newsletter_signup", "newsletter_cta_submit"].includes(e.event_name))
        .forEach((e) => {
          if (!e.created_at) return;
          const date = parseISO(e.created_at);
          if (!Number.isNaN(date.getTime())) {
            const dateKey = format(date, "yyyy-MM-dd");
            submissionsByDate[dateKey] = (submissionsByDate[dateKey] || 0) + 1;
          }
        });

      const startDateObj = parseISO(startDate);
      const timelineStart = Number.isNaN(startDateObj.getTime()) ? new Date(Date.now() - 7 * 86400000) : startDateObj;

      const submissionTimeline = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(timelineStart);
        date.setDate(date.getDate() + i);
        const dateKey = format(date, "yyyy-MM-dd");
        return {
          date: format(date, "MMM d"),
          submissions: submissionsByDate[dateKey] || 0,
        };
      });

      // Top CTA conversion pages
      const pageCtaCounts: Record<string, number> = {};
      ctaEvents
        .filter((e) => e.event_name === "newsletter_cta_click")
        .forEach((e) => {
          const page = e.page_path || "/";
          pageCtaCounts[page] = (pageCtaCounts[page] || 0) + 1;
        });

      const topCtaPages = Object.entries(pageCtaCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([page, count]) => ({ page, count }));

      return {
        ctaViews,
        ctaClicks,
        ctaConversion,
        viewToSubmit,
        submissions,
        activeSubs,
        totalSubs,
        newSubs,
        unsubscribed,
        topCtaPages,
        editions,
        submissionTimeline,
        hasCtaEvents,
        hasEditions,
        hasSendData,
        avgOpenRate,
      };
    },
    staleTime: 300000,
  });

  if (isLoading) return <LoadingSkeleton className="h-40 w-full" />;

  if (!data) return <p className="text-sm text-muted-foreground">No data available</p>;

  if (data.totalSubs === 0 && !data.hasEditions && !data.hasCtaEvents) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
        <Mail className="h-10 w-10 text-muted-foreground/40 mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Newsletter not yet launched</p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
          Subscriber metrics, CTA conversion rates, and edition performance will appear here once a newsletter is configured and subscribers start signing up.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Active Subscribers", value: data.activeSubs },
          { label: "Total Subscribers", value: data.totalSubs },
          { label: "New (period)", value: data.newSubs },
          { label: "CTA Conversion", value: data.hasCtaEvents ? `${data.ctaConversion}%` : "—" },
          { label: "Submissions", value: data.hasCtaEvents ? data.submissions : "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border p-3 text-center">
            <p className="text-xl font-bold">
              {typeof stat.value === "number" ? (stat.value ?? 0).toLocaleString() : stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {!data.hasCtaEvents && <PlaceholderCard message="CTA tracking events (view, click, submit) will populate within 24–48 hours" />}

      {data.hasCtaEvents && (
        <div>
          <h4 className="text-sm font-medium mb-3">Newsletter Submissions Over Time</h4>
          <ChartContainer
            config={{
              submissions: {
                label: "Submissions",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[220px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.submissionTimeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Top CTA Conversion Pages</h4>
          <div className="space-y-1.5">
            {data.topCtaPages.length ? (
              data.topCtaPages.map((item) => (
                <div key={item.page} className="flex justify-between text-xs border rounded p-2">
                  <span className="font-mono truncate max-w-[200px]">{item.page}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {(item.count ?? 0).toLocaleString()} clicks
                  </Badge>
                </div>
              ))
            ) : data.hasCtaEvents ? (
              <p className="text-xs text-muted-foreground">No CTA clicks recorded</p>
            ) : (
              <PlaceholderCard message="CTA click data will appear once tracking events start flowing" />
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Recent Newsletter Editions</h4>
          <div className="space-y-1.5">
            {data.hasEditions ? (
              data.editions.map((edition) => (
                <div key={edition.id} className="border rounded p-2 text-xs">
                  <p className="font-medium truncate">{edition.subject_line || "Untitled"}</p>
                  <div className="flex gap-3 mt-1 text-muted-foreground">
                    <span>Sent: {(edition.total_sent ?? 0).toLocaleString()}</span>
                    <span>Opened: {(edition.total_opened ?? 0).toLocaleString()}</span>
                    <span>
                      Rate: {(edition.total_sent ?? 0) > 0 ? Math.round(((edition.total_opened ?? 0) / (edition.total_sent ?? 1)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <PlaceholderCard message="No newsletter editions sent yet — metrics will appear after the first send" />
            )}
          </div>
        </div>
      </div>

      <InsightsCard
        insights={(() => {
          const insights: string[] = [];
          const activeSubs = data.activeSubs;
          const totalSubs = data.totalSubs;
          const unsubscribed = data.unsubscribed;

          if (totalSubs === 0 && !data.hasCtaEvents) {
            insights.push(
              "1. No subscribers and no CTA tracking events yet. Start by adding newsletter signup CTAs to your highest-traffic pages — article pages, homepage, and the 3 Before 9 briefing page are ideal placements."
            );
            insights.push("2. Use the EndOfContentNewsletter component at the bottom of articles and the InlineNewsletterSignup component mid-article for maximum visibility.");
            insights.push("3. Industry benchmark: well-placed CTAs on content sites convert 2-5% of page views to signups.");
            return insights;
          }

          const conversion = data.ctaConversion;
          const viewToSubmit = data.viewToSubmit;

          if (data.hasCtaEvents) {
            if (conversion === 0 && data.ctaViews > 0) {
              insights.push(
                `1. ${(data.ctaViews ?? 0).toLocaleString()} CTA views but 0 clicks — your CTA is being seen but ignored. Test: (a) change the headline from generic "Subscribe" to value-driven copy like "Get the AI briefing every morning, free", (b) add social proof ("Join 500+ readers"), (c) try a different colour that contrasts with the page background.`
              );
            } else if (conversion < 2) {
              insights.push(
                `1. CTA view-to-click rate is ${conversion}% (${(data.ctaClicks ?? 0).toLocaleString()} clicks from ${(data.ctaViews ?? 0).toLocaleString()} views) — below the 2-5% industry average. Reposition CTAs: place one inline at ~40% scroll depth in articles and another as a sticky footer bar on mobile. Test urgency copy like "Today's briefing drops at 9am".`
              );
            } else if (conversion >= 5) {
              insights.push(
                `1. CTA conversion at ${conversion}% — above the 2-5% industry average (${(data.ctaClicks ?? 0).toLocaleString()} clicks from ${(data.ctaViews ?? 0).toLocaleString()} views). Your placement and copy are working. Scale by adding CTAs to more pages, especially category landing pages and guide pages.`
              );
            } else {
              insights.push(
                `1. CTA conversion at ${conversion}% — within the 2-5% industry benchmark. View-to-submit rate: ${viewToSubmit}%. To improve: reduce form friction (single email field, no name required) and add an instant confirmation with a preview of what they'll receive.`
              );
            }

            if (data.hasSendData) {
              const openRate = data.avgOpenRate;
              if (openRate < 20) {
                insights.push(
                  `2. Average open rate is ${openRate}% — below the 20-25% industry benchmark. Test subject lines: use numbers, questions, or preview the top story. Send time also matters — test Tuesday/Wednesday mornings vs current schedule.`
                );
              } else if (openRate >= 35) {
                insights.push(
                  `2. ${openRate}% average open rate — excellent, well above the 20-25% industry norm. Your subject lines and send timing are resonating. Consider adding A/B testing on subject lines to push even higher.`
                );
              } else {
                insights.push(
                  `2. ${openRate}% average open rate — solid, at or above the 20-25% industry benchmark. ${unsubscribed > 0 ? `${unsubscribed} unsubscribes (${Math.round((unsubscribed / Math.max(totalSubs, 1)) * 100)}% churn) — monitor this after each send.` : "No unsubscribes yet — great retention."}`
                );
              }
            } else if (activeSubs > 0) {
              insights.push(
                `2. You have ${(activeSubs ?? 0).toLocaleString()} confirmed subscriber${activeSubs === 1 ? "" : "s"} but no editions sent yet. Send your first newsletter to establish a cadence — weekly sends see the best balance of engagement and low unsubscribe rates.`
              );
            }
          }

          const newSubs = data.newSubs;
          if (newSubs > 0 && activeSubs > 0) {
            const growthRate = Math.round((newSubs / activeSubs) * 100);
            insights.push(
              `3. ${(newSubs ?? 0).toLocaleString()} new subscriber${newSubs === 1 ? "" : "s"} this period (${growthRate}% growth). ${newSubs >= 10 ? `Strong growth — set up a 3-email welcome sequence: (1) "Here's what to expect", (2) "Our 3 best articles", (3) "Reply and tell us what topics you care about".` : "Steady trickle — boost signups by adding exit-intent popups on desktop and a floating signup bar on mobile."}`
            );
          } else if (newSubs === 0 && activeSubs > 0) {
            insights.push(
              "3. No new subscribers this period. Re-audit your CTA placements: are they visible without scrolling? Test adding a full-width signup banner between articles on the homepage and at the end of each 3 Before 9 briefing."
            );
          }

          return insights;
        })()}
      />
    </div>
  );
};

// ============================================================================
// SECTION 8: BriefingSection
// ============================================================================

interface BriefingData {
  views: number;
  storyReads: number;
  completions: number;
  outboundClicks: number;
  contextExpands: number;
  completionRate: number;
  storiesPerView: string;
  weeklyData: Array<{ week: string; sessions: number }>;
  editions: Array<{ id: string; subject_line: string; edition_date: string }>;
  totalBriefingSessions: number;
  avgDuration: number;
  hasEventData: boolean;
  thisWeek: number;
  lastWeek: number;
}

export const BriefingSection: React.FC<{ startDate: string; range: string }> = ({ startDate, range }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-hub-briefing", range],
    queryFn: async () => {
      const decStartDate = "2025-12-01T00:00:00.000Z";
      const effectiveStart = decStartDate < startDate ? decStartDate : startDate;

      const [eventsRes, sessionsRes, editionsRes] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("event_name, event_data, created_at")
          .in("event_name", ["briefing_view", "briefing_story_read", "briefing_complete", "briefing_outbound_click", "briefing_context_expand"])
          .gte("created_at", startDate)
          .limit(500),
        supabase
          .from("analytics_sessions")
          .select("session_id, started_at, landing_page, duration_seconds")
          .like("landing_page", "%three-before-nine%")
          .gte("started_at", effectiveStart)
          .order("started_at", { ascending: true })
          .limit(1000),
        supabase
          .from("newsletter_editions")
          .select("id, edition_date, subject_line")
          .eq("status", "sent")
          .order("edition_date", { ascending: false })
          .limit(5),
      ]);

      const events = eventsRes.data ?? [];
      const sessions = sessionsRes.data ?? [];
      const editions = editionsRes.data ?? [];

      const views = events.filter((e) => e.event_name === "briefing_view").length;
      const storyReads = events.filter((e) => e.event_name === "briefing_story_read").length;
      const completions = events.filter((e) => e.event_name === "briefing_complete").length;
      const outboundClicks = events.filter((e) => e.event_name === "briefing_outbound_click").length;
      const contextExpands = events.filter((e) => e.event_name === "briefing_context_expand").length;
      const completionRate = views > 0 ? Math.round((completions / views) * 100) : 0;
      const storiesPerView = views > 0 ? (storyReads / views).toFixed(1) : "0";

      const startDateObj = parseISO(effectiveStart);
      const timelineStart = Number.isNaN(startDateObj.getTime()) ? new Date("2025-12-01") : startDateObj;

      // Generate weekly intervals
      const weeklyData = Array.from({ length: Math.ceil((new Date().getTime() - timelineStart.getTime()) / (7 * 86400000)) + 1 }, (_, i) => {
        const weekStart = new Date(timelineStart);
        weekStart.setDate(weekStart.getDate() + i * 7);
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

        const sessionsInWeek = sessions.filter((s) => {
          if (!s.started_at) return false;
          const sessDate = parseISO(s.started_at);
          return !Number.isNaN(sessDate.getTime()) && isWithinInterval(sessDate, { start: weekStart, end: weekEnd });
        }).length;

        return {
          week: format(weekStart, "MMM d"),
          sessions: sessionsInWeek,
        };
      });

      const totalBriefingSessions = sessions.length;
      const avgDuration = sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + Math.min(s.duration_seconds ?? 0, 1800), 0) / sessions.length) : 0;

      const lastTwoWeeks = weeklyData.slice(-2);
      const thisWeekSessions = lastTwoWeeks[lastTwoWeeks.length - 1]?.sessions ?? 0;
      const lastWeekSessions = lastTwoWeeks.length >= 2 ? lastTwoWeeks[0]?.sessions ?? 0 : 0;

      return {
        views,
        storyReads,
        completions,
        outboundClicks,
        contextExpands,
        completionRate,
        storiesPerView,
        weeklyData,
        editions,
        totalBriefingSessions,
        avgDuration,
        hasEventData: events.length > 0,
        thisWeek: thisWeekSessions,
        lastWeek: lastWeekSessions,
      };
    },
    staleTime: 300000,
  });

  if (isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (!data) return <p className="text-sm text-muted-foreground">No data available</p>;

  return (
    <div className="space-y-6">
      {!data.hasEventData && <PlaceholderCard message="Briefing tracking events (view, story read, complete) will populate within 24–48 hours" />}

      {data.hasEventData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Briefing Views", value: data.views },
            { label: "Stories Read", value: data.storyReads },
            { label: "Completions", value: data.completions },
            { label: "Completion Rate", value: `${data.completionRate}%` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold">
                {typeof stat.value === "number" ? (stat.value ?? 0).toLocaleString() : stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium mb-3">Weekly 3 Before 9 Sessions (since Dec 2025)</h4>
        <ChartContainer
          config={{
            sessions: {
              label: "Sessions",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="week" className="text-xs" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Engagement Breakdown</h4>
          {data.hasEventData ? (
            <div className="space-y-2">
              {[
                { label: "Outbound Clicks", value: data.outboundClicks },
                { label: "Context Expands", value: data.contextExpands },
                { label: "Stories per View", value: data.storiesPerView },
                { label: "Total Sessions", value: data.totalBriefingSessions },
                { label: "Avg Session Duration", value: `${data.avgDuration}s` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm border rounded p-2">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge variant="secondary" className="font-mono">
                    {typeof item.value === "number" ? (item.value ?? 0).toLocaleString() : item.value}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { label: "Total Sessions", value: data.totalBriefingSessions },
                { label: "Avg Session Duration", value: `${data.avgDuration}s` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm border rounded p-2">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge variant="secondary" className="font-mono">
                    {typeof item.value === "number" ? (item.value ?? 0).toLocaleString() : item.value}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Recent Editions</h4>
          <div className="space-y-1.5">
            {data.editions.length ? (
              data.editions.map((edition) => (
                <div key={edition.id} className="border rounded p-2 text-xs">
                  <p className="font-medium truncate">{edition.subject_line || "Untitled"}</p>
                  <p className="text-muted-foreground mt-0.5">{edition.edition_date}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No published editions</p>
            )}
          </div>
        </div>
      </div>

      <InsightsCard
        insights={(() => {
          const insights: string[] = [];
          const totalSessions = data.totalBriefingSessions;
          const thisWeek = data.thisWeek;
          const lastWeek = data.lastWeek;

          if (totalSessions === 0 && !data.hasEventData) {
            insights.push(
              "1. No briefing sessions or events tracked yet. Verify: (a) the ThreeBeforeNineTicker component links to /three-before-nine/latest, (b) the briefing page fires briefing_view on mount via useGA4ContentTracking, and (c) briefing_story_read fires when each story card scrolls into view."
            );
            insights.push("2. Once tracking is active, you'll see weekly session trends, completion rates, and outbound click analysis.");
            insights.push("3. Target benchmark: well-formatted daily briefings typically see 60-80% completion rates when kept under 500 words total.");
            return insights;
          }

          if (lastWeek > 0 && thisWeek > 0) {
            const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
            if (change > 10) {
              insights.push(
                `1. Briefing sessions up ${change}% this week (${thisWeek} vs ${lastWeek} last week). Momentum is building — maintain daily publishing cadence and promote new editions via push notification within 30 minutes of publish.`
              );
            } else if (change < -10) {
              insights.push(
                `1. Briefing sessions dropped ${Math.abs(change)}% (${thisWeek} vs ${lastWeek} last week). Check: was an edition missed? Were subject lines less compelling? Review the 3 highest-traffic days and replicate what worked.`
              );
            } else {
              insights.push(
                `1. Briefing readership stable at ~${thisWeek} sessions/week. To break the plateau, try cross-promoting the briefing at the end of regular articles with a CTA like "Get tomorrow's AI signals at 9am".`
              );
            }
          } else if (totalSessions > 0) {
            insights.push(
              `1. ${(totalSessions ?? 0).toLocaleString()} total briefing sessions tracked. Week-over-week trends will show once 2+ weeks of data accumulate. Current avg session: ${data.avgDuration}s.`
            );
          }

          const completionRate = data.completionRate;
          const views = data.views;

          if (data.hasEventData && views > 0) {
            if (completionRate < 50) {
              insights.push(
                `2. ${completionRate}% completion rate across ${(views ?? 0).toLocaleString()} views — below the 60-80% benchmark for briefing-style content. Shorten individual signal summaries to under 200 words each, use bold headlines for scannability, and put the most compelling story first to hook readers.`
              );
            } else if (completionRate >= 80) {
              insights.push(
                `2. ${completionRate}% completion rate — excellent. Readers are consuming the full briefing. ${Number(data.storiesPerView) > 2 ? `They read an avg of ${data.storiesPerView} stories per view, showing strong engagement depth.` : "Consider adding a 4th story to test appetite for more content."}`
              );
            } else {
              insights.push(
                `2. ${completionRate}% completion rate — solid. ${(data.storyReads ?? 0).toLocaleString()} total story reads across ${(views ?? 0).toLocaleString()} views (${data.storiesPerView} stories/view avg). Experiment with story order — put opinion/analysis pieces before straight news to see if completion improves.`
              );
            }
          }

          const clicks = data.outboundClicks;
          if (views > 0 && clicks > 0) {
            const clickRate = Math.round((clicks / views) * 100);
            insights.push(
              `3. ${clickRate}% of briefing readers click source links (${(clicks ?? 0).toLocaleString()} clicks). ${clickRate > 20 ? "Excellent engagement — readers trust your curation. Add sponsored/affiliate links alongside editorial ones to monetise this traffic." : 'Make source links more prominent with styled "Read the full story →" CTAs and consider opening them in new tabs to preserve the briefing session.'}`
            );
          } else if (data.hasEventData && views > 0 && clicks === 0) {
            insights.push(
              `3. No outbound clicks tracked — readers are consuming the summaries but not clicking through. Either the summaries are comprehensive enough (good) or source links aren't prominent enough. Test adding "Read more →" buttons with contrasting styling.`
            );
          } else {
            const duration = data.avgDuration;
            if (duration > 0) {
              insights.push(
                `3. Average briefing session: ${duration}s. ${duration < 60 ? "Readers are scanning quickly — lead with the most newsworthy story and use bullet points for rapid consumption." : duration > 180 ? "Deep engagement — readers are spending significant time. This is your stickiest content format." : "Healthy read time for a briefing format."}`
              );
            }
          }

          return insights;
        })()}
      />
    </div>
  );
};


// Domain classification and helpers used by later sections (helpers defined above)

// Domain classification arrays
const ignoreDomains = ["lovable.app", "lovable.dev", "lovableproject.com", "ai-in-asia.lovable.app", "aiinasia.com", "www.aiinasia.com", "ai-in-asia.com", "www.ai-in-asia.com"];
const socialDomains = ["t.co", "twitter.com", "x.com", "facebook.com", "linkedin.com", "reddit.com", "threads.net", "instagram.com", "youtube.com", "tiktok.com", "pinterest.com"];
const searchEngines = ["google.com", "google.co", "bing.com", "duckduckgo.com", "yahoo.com", "baidu.com", "yandex.com", "ecosia.org", "search.brave.com"];

// Color palette
const deviceColors = ["hsl(var(--primary))", "hsl(var(--primary) / 0.75)", "hsl(var(--primary) / 0.5)", "hsl(var(--primary) / 0.35)", "hsl(var(--primary) / 0.2)"];

// Traffic classification function
function classifyTraffic(referrer: string): "Direct" | "Organic Search" | "Social Media" | "Other Sites" {
  if (referrer === "direct") return "Direct";
  if (searchEngines.some(se => referrer.includes(se))) return "Organic Search";
  if (socialDomains.some(sd => referrer.includes(sd))) return "Social Media";
  return "Other Sites";
}

// Social platform mapping
const socialPlatformMap: Record<string, string> = {
  twitter: "Twitter/X",
  x: "Twitter/X",
  "t.co": "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  fb: "Facebook",
  instagram: "Instagram",
  ig: "Instagram",
  reddit: "Reddit",
  youtube: "YouTube",
  tiktok: "TikTok"
};

const socialDomainMap: Record<string, string> = {
  "t.co": "Twitter/X",
  "twitter.com": "Twitter/X",
  "x.com": "Twitter/X",
  "linkedin.com": "LinkedIn",
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "reddit.com": "Reddit",
  "youtube.com": "YouTube",
  "tiktok.com": "TikTok"
};

const socialColors: Record<string, string> = {
  "Twitter/X": "hsl(200 90% 50%)",
  LinkedIn: "hsl(210 80% 45%)",
  Facebook: "hsl(220 70% 50%)",
  Instagram: "hsl(330 70% 55%)",
  Reddit: "hsl(16 100% 50%)",
  YouTube: "hsl(0 80% 50%)",
  TikTok: "hsl(170 70% 45%)",
  Other: "hsl(var(--muted-foreground))"
};

const socialPlatformLabels: Record<string, string> = {
  facebook: "Facebook",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube"
};

// Helper functions
function formatNumber(a: number | string, fallback = "0"): string {
  const num = typeof a === "number" ? a : Number(a);
  return Number.isFinite(num) ? num.toLocaleString() : fallback;
}

async function fetchSocialSessions(startDate: string) {
  const results = [];
  let offset = 0;
  for (;;) {
    const { data } = await supabase
      .from("analytics_sessions")
      .select("utm_source,utm_medium,utm_campaign,referrer_domain,duration_seconds,is_bounce,page_count")
      .gte("started_at", startDate)
      .range(offset, offset + 999);
    const batch = data ?? [];
    if (results.push(...batch), batch.length < 1000) break;
    offset += 1000;
  }
  return results;
}

async function callPubierAPI(endpoint: string, params?: Record<string, string>) {
  const session = (await supabase.auth.getSession()).data.session;
  if (session?.access_token) {
    const projectId = "pbmtnvxywplgpldmlygv";
    const queryParams = new URLSearchParams({ endpoint, ...params }).toString();
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/publer-proxy?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBibXRudnh5d3BsZ3BsZG1seWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjYwOTMsImV4cCI6MjA3NzA0MjA5M30.Xt29HhlYkz3BJW9VlMBzNF-_hqmfiqOLF8HmonOxfvg"
        }
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`publer-proxy ${response.status}: ${text}`);
    }
    return response.json();
  }
  throw new Error("Not signed in");
}

async function fetchOrganiicSessions(startDate: string) {
  const results = [];
  let offset = 0;
  for (;;) {
    const { data } = await supabase
      .from("analytics_sessions")
      .select("referrer_domain,landing_page,started_at,duration_seconds,is_bounce,page_count")
      .gte("started_at", startDate)
      .range(offset, offset + 999);
    const batch = data ?? [];
    if (results.push(...batch), batch.length < 1000) break;
    offset += 1000;
  }
  return results;
}

async function fetchPageviews(startDate: string) {
  const results = [];
  let offset = 0;
  for (;;) {
    const { data } = await supabase
      .from("analytics_pageviews")
      .select("page_path,viewed_at")
      .gte("viewed_at", startDate)
      .range(offset, offset + 999);
    const batch = data ?? [];
    if (results.push(...batch), batch.length < 1000) break;
    offset += 1000;
  }
  return results;
}

async function getGoogleOAuthStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { connected: {} };
    const response = await fetch(
      "https://pbmtnvxywplgpldmlygv.supabase.co/functions/v1/google-oauth?action=status",
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    return response.ok ? { connected: (await response.json())?.connected ?? {} } : { connected: {} };
  } catch {
    return { connected: {} };
  }
}

function getPlatformFromPost(post: any): string {
  return (post.platform || post.type || "unknown").toLowerCase();
}

const PRERENDER_FIX_DATE = "2026-03-21";
const SEARCH_ENGINE_MAP: Record<string, string> = {
  "google.com": "Google",
  "google.co": "Google",
  "google.co.uk": "Google",
  "google.co.in": "Google",
  "google.co.jp": "Google",
  "google.de": "Google",
  "google.fr": "Google",
  "bing.com": "Bing",
  "duckduckgo.com": "DuckDuckGo",
  "yahoo.com": "Yahoo",
  "baidu.com": "Baidu",
  "yandex.com": "Yandex",
  "ecosia.org": "Ecosia",
  "search.brave.com": "Brave"
};

function detectSearchEngine(referrer: string): string | null {
  const lower = (referrer || "").toLowerCase();
  for (const [key, value] of Object.entries(SEARCH_ENGINE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return null;
}

// ============= AUDIENCE SECTION =============
export const AudienceSection = ({ startDate, range, totalSessions }: { startDate: string; range: string; totalSessions?: number }) => {
  const { data: audienceData, isLoading } = useQuery({
    queryKey: ["analytics-hub-audience", range],
    queryFn: async () => {
      const sessions = [];
      let offset = 0;
      for (; sessions.length < 10000;) {
        const { data: batch } = await supabase
          .from("analytics_sessions")
          .select("country, city, device_type, browser, os, referrer_domain, utm_source, utm_medium")
          .gte("started_at", startDate)
          .range(offset, offset + 999);
        const items = batch ?? [];
        if (sessions.push(...items), items.length < 1000) break;
        offset += 1000;
      }

      const total = totalSessions || sessions.length;
      const countries: Record<string, number> = {};
      let unknownCount = 0;
      sessions.forEach(s => {
        const country = s?.country;
        if (!country || country === "Unknown") unknownCount++;
        else countries[country] = (countries[country] || 0) + 1;
      });

      const topCountries = Object.entries(countries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count }));

      const countryCoverage = total > 0 ? Math.round((total - unknownCount) / total * 100) : 0;

      const devices: Record<string, number> = {};
      sessions.forEach(s => {
        const device = s?.device_type || "unknown";
        devices[device] = (devices[device] || 0) + 1;
      });
      const deviceData = Object.entries(devices)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const browsers: Record<string, number> = {};
      sessions.forEach(s => {
        const browser = s?.browser || "Unknown";
        browsers[browser] = (browsers[browser] || 0) + 1;
      });
      const topBrowsers = Object.entries(browsers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([browser, count]) => ({ browser, count }));

      const operatingSystems: Record<string, number> = {};
      sessions.forEach(s => {
        const os = s?.os || "Unknown";
        operatingSystems[os] = (operatingSystems[os] || 0) + 1;
      });
      const topOS = Object.entries(operatingSystems)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([os, count]) => ({ os, count }));

      const referrers: Record<string, number> = {};
      const trafficChannels = {
        Direct: 0,
        "Organic Search": 0,
        "Social Media": 0,
        "Other Sites": 0
      };

      sessions.forEach(s => {
        const domain = s?.referrer_domain || "direct";
        if (!ignoreDomains.some(id => domain.includes(id))) {
          referrers[domain] = (referrers[domain] || 0) + 1;
          trafficChannels[classifyTraffic(domain)]++;
        }
      });

      const filteredTotal = Object.values(referrers).reduce((a, b) => a + b, 0);
      const topReferrers = Object.entries(referrers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([domain, count]) => ({
          domain,
          count,
          pct: filteredTotal > 0 ? Math.round(count / filteredTotal * 100) : 0,
          category: classifyTraffic(domain)
        }));

      const referralBreakdown = Object.entries(trafficChannels)
        .map(([name, value]) => ({
          name,
          value,
          pct: filteredTotal > 0 ? Math.round(value / filteredTotal * 100) : 0
        }))
        .sort((a, b) => b.value - a.value);

      const utmSources: Record<string, number> = {};
      sessions.forEach(s => {
        if (!s?.utm_source) return;
        const key = s.utm_medium ? `${s.utm_source} / ${s.utm_medium}` : s.utm_source;
        utmSources[key] = (utmSources[key] || 0) + 1;
      });
      const topUTM = Object.entries(utmSources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([source, count]) => ({ source, count }));

      return {
        totalSessions: total,
        filteredTotal,
        topCountries,
        countryCoverage,
        unknownCount,
        deviceData,
        topBrowsers,
        topOS,
        topReferrers,
        referralCategories: referralBreakdown,
        topUTM
      };
    },
    staleTime: 300000
  });

  if (isLoading) return <LoadingSkeleton className="h-48 w-full" />;
  if (!audienceData) return <PlaceholderCard message="No data available" />;

  const hasCountryData = (audienceData?.topCountries ?? []).length > 0;
  const maxReferrerCount = Math.max(...(audienceData?.topReferrers ?? []).map(r => r.count), 1);

  const insights = (() => {
    const list: string[] = [];
    const filteredTotal = audienceData?.filteredTotal ?? 0;
    if (filteredTotal === 0) {
      list.push("1. No session data yet — set up analytics tracking by ensuring the AnalyticsProvider component wraps your app and useAnalyticsTracking fires on page load.");
      list.push("2. Once sessions flow, this section will show traffic sources, geographic breakdown, and device mix automatically.");
      return list;
    }

    const direct = audienceData?.referralCategories?.find(x => x.name === "Direct");
    const organic = audienceData?.referralCategories?.find(x => x.name === "Organic Search");
    const social = audienceData?.referralCategories?.find(x => x.name === "Social Media");
    const directPct = direct?.pct ?? 0;
    const organicPct = organic?.pct ?? 0;
    const socialPct = social?.pct ?? 0;

    if (directPct > 70) {
      list.push(`1. Direct traffic is ${directPct}% of sessions (${(direct?.value ?? 0).toLocaleString()} visits) — heavy reliance on direct/bookmarked visits. Diversify acquisition: target 3-5 long-tail keywords for organic search, share articles on LinkedIn/X within 1 hour of publish, and add UTM tags to newsletter links to measure email-driven traffic.`);
    } else if (organicPct > 40) {
      list.push(`1. Organic search drives ${organicPct}% of traffic (${(organic?.value ?? 0).toLocaleString()} sessions) — strong SEO foundation. Double down by updating meta descriptions on your top 10 articles and targeting featured snippet formats (listicles, how-tos, comparison tables).`);
    } else {
      list.push(`1. Traffic mix: Direct ${directPct}%, Search ${organicPct}%, Social ${socialPct}%. ${organicPct < 15 ? "Organic search is underperforming — audit your top 20 articles for missing focus keyphrases and internal linking gaps." : "Healthy distribution across channels."}`);
    }

    const topReferrer = (audienceData?.topReferrers ?? []).find(r => r.domain !== "direct");
    if (topReferrer) {
      const pct = topReferrer.count > 0 && filteredTotal > 0 ? Math.round(topReferrer.count / filteredTotal * 100) : 0;
      list.push(`2. Top external referrer "${topReferrer.domain}" drives ${(topReferrer.count ?? 0).toLocaleString()} sessions (${pct}% of traffic). ${pct > 15 ? "Strong channel — create content specifically for this audience and consider a partnership or guest posting exchange." : "Moderate contribution — test sharing more content on this platform to see if traffic scales linearly."}`);
    } else {
      list.push("2. No significant external referrers detected. Start building backlinks: submit guest articles to industry publications, get listed on AI tool directories, and share on LinkedIn with a compelling hook (question or surprising stat).");
    }

    const topCountry = (audienceData?.topCountries ?? [])[0];
    const mobileDevice = (audienceData?.deviceData ?? []).find(d => d.name === "mobile");
    const mobilePct = mobileDevice && filteredTotal > 0 ? Math.round(mobileDevice.value / filteredTotal * 100) : 0;
    const countryText = topCountry ? `Top market: ${topCountry.country} (${Math.round((topCountry?.count ?? 0) / filteredTotal * 100)}%).` : hasCountryData ? "" : "Geo data populating — check back in 24-48h.";
    const mobileText = mobilePct > 60 ? `${mobilePct}% mobile — ensure CTAs, newsletter forms, and article layouts are touch-optimised.` : mobilePct < 30 ? `Only ${mobilePct}% mobile (desktop-heavy audience) — optimise for widescreen reading with sidebar content.` : `${mobilePct}% mobile — balanced device mix.`;

    list.push(`3. ${countryText} ${mobileText}`);
    return list;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-4">Traffic Sources</h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Channel Breakdown */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Channel Breakdown</h5>
            <div className="space-y-2.5">
              {(audienceData?.referralCategories ?? []).map(ch => (
                <div key={ch.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{ch.name}</span>
                    <span className="text-muted-foreground">
                      {(ch?.value ?? 0).toLocaleString()} ({ch?.pct ?? 0}%)
                    </span>
                  </div>
                  <Progress value={ch.pct} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Referrers Chart */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3">Top Referrers</h5>
            {(audienceData?.topReferrers ?? []).length > 0 ? (
              <ChartContainer
                config={{ count: { label: "Sessions", color: "hsl(var(--primary))" } }}
                className="h-[280px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(audienceData?.topReferrers ?? []).slice(0, 10)}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="domain" type="category" className="text-xs" width={95} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-xs text-muted-foreground">No referrer data yet</p>
            )}
          </div>
        </div>

        {/* Referrer Details Table */}
        {(audienceData?.topReferrers ?? []).length > 0 && (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(audienceData?.topReferrers ?? []).map((ref, i) => (
                  <TableRow key={ref.domain}>
                    <TableCell className="text-muted-foreground font-medium">{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[180px]">{ref.domain}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {ref.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {(ref?.count ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{ref?.pct ?? 0}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Countries & Devices */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div>
          <h4 className="text-sm font-medium mb-3">Top Countries</h4>
          {hasCountryData ? (
            <>
              <ChartContainer
                config={{ count: { label: "Sessions", color: "hsl(var(--primary))" } }}
                className="h-[280px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={audienceData?.topCountries ?? []}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="country" type="category" className="text-xs" width={75} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              {(audienceData?.countryCoverage ?? 0) < 80 && (
                <PlaceholderCard message={`Country data available for ${audienceData?.countryCoverage ?? 0}% of sessions — coverage will improve over the next 24–48 hours as new sessions are geo-located`} />
              )}
            </>
          ) : (
            <PlaceholderCard message="Country data is being collected via IP geolocation — it will populate as new sessions are created over the next 24–48 hours" />
          )}
        </div>

        {/* Devices Pie */}
        <div>
          <h4 className="text-sm font-medium mb-3">Devices</h4>
          {(audienceData?.deviceData ?? []).length ? (
            <ChartContainer
              config={{ value: { label: "Sessions" } }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audienceData?.deviceData ?? []}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {(audienceData?.deviceData ?? []).map((_, i) => (
                      <Cell key={`cell-${i}`} fill={deviceColors[i % deviceColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No device data</p>
          )}
        </div>
      </div>

      {/* Browsers & OS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Browsers</h4>
          <div className="space-y-1.5">
            {(audienceData?.topBrowsers ?? []).map(br => (
              <div key={br.browser} className="flex justify-between text-xs border rounded p-2">
                <span>{br.browser}</span>
                <Badge variant="outline" className="text-[10px]">
                  {(br?.count ?? 0).toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Operating Systems</h4>
          <div className="space-y-1.5">
            {(audienceData?.topOS ?? []).map(os => (
              <div key={os.os} className="flex justify-between text-xs border rounded p-2">
                <span>{os.os}</span>
                <Badge variant="outline" className="text-[10px]">
                  {(os?.count ?? 0).toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UTM Sources */}
      {(audienceData?.topUTM ?? []).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">UTM Sources</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(audienceData?.topUTM ?? []).map(utm => (
              <div key={utm.source} className="border rounded p-2 text-center">
                <p className="text-sm font-bold">{(utm?.count ?? 0).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground truncate">{utm.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <InsightsCard insights={insights} />
    </div>
  );
};

// ============= SOCIAL MEDIA SECTION =============
export const SocialMediaSection = ({ startDate, range }: { startDate: string; range: string }) => {
  const { data: socialData, isLoading: socialLoading } = useQuery({
    queryKey: ["analytics-social-media", range],
    queryFn: async () => {
      const now = new Date().toISOString();
      const [sessions, totalRes] = await Promise.all([
        fetchSocialSessions(startDate),
        supabase.rpc("get_total_sessions", { p_start: startDate, p_end: now })
      ]);

      const totalSessions = (totalRes.error ? null : totalRes.data) ?? sessions.length;
      const socialSessions = [];
      let directCount = 0;

      for (const session of sessions) {
        const source = (session.utm_source || "").toLowerCase();
        const domain = (session.referrer_domain || "").toLowerCase();
        let platform: string | null = null;

        for (const [key, value] of Object.entries(socialPlatformMap)) {
          if (source.includes(key)) {
            platform = value;
            break;
          }
        }

        if (!platform) {
          for (const [key, value] of Object.entries(socialDomainMap)) {
            if (domain.includes(key)) {
              platform = value;
              break;
            }
          }
        }

        if (platform) {
          socialSessions.push({
            platform,
            campaign: session.utm_campaign || null,
            duration: Math.min(session.duration_seconds ?? 0, 1800),
            isBounce: session.is_bounce ?? true,
            pageCount: session.page_count ?? 1
          });
        } else if (!domain || domain === "direct") {
          directCount++;
        }
      }

      const platformStats: Record<string, any> = {};
      for (const session of socialSessions) {
        if (!platformStats[session.platform]) {
          platformStats[session.platform] = {
            sessions: 0,
            totalDuration: 0,
            bounces: 0,
            totalPages: 0
          };
        }
        platformStats[session.platform].sessions++;
        platformStats[session.platform].totalDuration += session.duration;
        platformStats[session.platform].bounces += session.isBounce ? 1 : 0;
        platformStats[session.platform].totalPages += session.pageCount;
      }

      const platforms = Object.entries(platformStats)
        .map(([name, stats]) => ({
          name,
          sessions: stats.sessions,
          pct: socialSessions.length > 0 ? Math.round(stats.sessions / socialSessions.length * 100) : 0,
          avgDuration: stats.sessions > 0 ? Math.round(stats.totalDuration / stats.sessions) : 0,
          bounceRate: stats.sessions > 0 ? Math.round(stats.bounces / stats.sessions * 100) : 0,
          pagesPerSession: stats.sessions > 0 ? (stats.totalPages / stats.sessions).toFixed(1) : "0"
        }))
        .sort((a, b) => b.sessions - a.sessions);

      const campaigns: Record<string, number> = {};
      for (const session of socialSessions) {
        if (session.campaign) {
          campaigns[session.campaign] = (campaigns[session.campaign] || 0) + 1;
        }
      }
      const topCampaigns = Object.entries(campaigns)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const avgDuration = socialSessions.length > 0 ? Math.round(socialSessions.reduce((a, s) => a + s.duration, 0) / socialSessions.length) : 0;
      const bounceRate = socialSessions.length > 0 ? Math.round(socialSessions.filter(s => s.isBounce).length / socialSessions.length * 100) : 0;

      return {
        totalSessions,
        totalSocial: socialSessions.length,
        directSessions: directCount,
        platforms,
        topCampaigns,
        socialAvgDuration: avgDuration,
        socialBounceRate: bounceRate
      };
    }
  });

  const { data: publerData, isLoading: publerLoading, error: publerError, refetch } = useQuery({
    queryKey: ["publer-posts", range],
    queryFn: async () => {
      const accounts = await callPubierAPI("accounts");
      const accountList = Array.isArray(accounts) ? accounts : accounts?.accounts || [];

      const [publishedRes, scheduledRes] = await Promise.all([
        callPubierAPI("posts", { state: "published", per_page: "100" }),
        callPubierAPI("posts", { state: "scheduled", per_page: "100" })
      ]);

      const published = Array.isArray(publishedRes) ? publishedRes : publishedRes?.posts || [];
      const scheduled = Array.isArray(scheduledRes) ? scheduledRes : scheduledRes?.posts || [];
      const allPosts = [
        ...published.map(p => ({ ...p, _state: "published" })),
        ...scheduled.map(p => ({ ...p, _state: "scheduled" }))
      ];

      const platformMap: Record<string, string> = {};
      for (const account of accountList) {
        platformMap[account.id] = getPlatformFromPost(account);
      }

      const platformStats: Record<string, any> = {};
      for (const post of allPosts) {
        const platform = post.platform || platformMap[post.account_id || ""] || "unknown";
        if (!platformStats[platform]) {
          platformStats[platform] = {
            scheduled: 0,
            published: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            impressions: 0,
            clicks: 0
          };
        }

        const stats = platformStats[platform];
        if (post._state === "scheduled") stats.scheduled++;
        else stats.published++;

        stats.likes += Number(post.likes || post.reactions) || 0;
        stats.comments += typeof post.comments === "number" ? post.comments : Array.isArray(post.comments) ? post.comments.length : 0;
        stats.shares += Number(post.shares || post.reposts || post.retweets) || 0;
        stats.impressions += Number(post.impressions) || 0;
        stats.clicks += Number(post.clicks || post.link_clicks) || 0;
      }

      const breakdown = Object.entries(platformStats)
        .map(([platform, stats]) => ({
          platform,
          label: socialPlatformLabels[platform] || platform,
          scheduled: stats.scheduled,
          published: stats.published,
          total: stats.scheduled + stats.published,
          ...stats
        }))
        .sort((a, b) => b.total - a.total);

      const totals = breakdown.reduce(
        (acc, p) => ({
          scheduled: acc.scheduled + p.scheduled,
          published: acc.published + p.published,
          total: acc.total + p.total,
          likes: acc.likes + p.likes,
          comments: acc.comments + p.comments,
          shares: acc.shares + p.shares,
          impressions: acc.impressions + p.impressions,
          clicks: acc.clicks + p.clicks
        }),
        { scheduled: 0, published: 0, total: 0, likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 }
      );

      const topPosts = [...published]
        .sort(
          (a, b) =>
            (b.engagement || b.total_engagement || (b.likes || 0) + (b.comments || 0) + (b.shares || 0)) -
            (a.engagement || a.total_engagement || (a.likes || 0) + (a.comments || 0) + (a.shares || 0))
        )
        .slice(0, 5)
        .map(p => ({
          text: (p.text || p.title || "").substring(0, 120),
          platform: p.platform || platformMap[p.account_id || ""] || "unknown",
          likes: p.likes || p.reactions || 0,
          comments: typeof p.comments === "number" ? p.comments : Array.isArray(p.comments) ? p.comments.length : 0,
          shares: p.shares || p.reposts || p.retweets || 0,
          impressions: p.impressions || 0,
          engagement:
            Number(p.engagement || p.total_engagement) ||
            (Number(p.likes) || 0) + (typeof p.comments === "number" ? p.comments : 0) + (Number(p.shares) || 0)
        }));

      return {
        accounts: accountList,
        posts: allPosts,
        platformBreakdown: breakdown,
        totals,
        topPosts
      };
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  if (socialLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-40 w-full" />
        <LoadingSkeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!socialData) return <PlaceholderCard message="Unable to load social media data." />;

  const data = socialData;
  const socialPct = data.totalSessions > 0 ? (data.totalSocial / data.totalSessions * 100).toFixed(1) : "0";

  const platformConfig: Record<string, any> = {};
  data.platforms.forEach(p => {
    platformConfig[p.name] = {
      label: p.name,
      color: socialColors[p.name] || socialColors.Other
    };
  });

  const platformChartData = data.platforms.map(p => ({
    name: p.name,
    sessions: p.sessions,
    fill: socialColors[p.name] || socialColors.Other
  }));

  const insights: string[] = [];
  if (data.totalSocial === 0) {
    insights.push("1. No social media traffic detected yet. Ensure UTM parameters are added to all social posts.");
    insights.push("2. Configure default UTM templates in Publer per platform to automate tracking.");
  } else {
    const topPlatform = data.platforms[0];
    if (topPlatform) {
      insights.push(
        `1. ${topPlatform.name} drives ${topPlatform.pct}% of social traffic (${(topPlatform.sessions ?? 0).toLocaleString()} sessions). ${topPlatform.bounceRate > 60 ? `Bounce rate is ${topPlatform.bounceRate}% — try platform-specific landing pages.` : `Engagement is solid (${topPlatform.avgDuration}s avg). Double down.`}`
      );
    }

    const lowPerformers = data.platforms.filter(p => p.sessions < 5);
    if (lowPerformers.length > 0) {
      insights.push(
        `2. ${lowPerformers.map(p => p.name).join(", ")} ${lowPerformers.length === 1 ? "has" : "have"} <5 sessions. Invest or reallocate.`
      );
    }

    if (parseFloat(socialPct) < 10) {
      insights.push(`3. Social traffic is only ${socialPct}% — benchmark is 15-25% for content sites.`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Social Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Social Sessions" value={(data.totalSocial ?? 0).toLocaleString()} sub={`${socialPct}% of total`} />
        <StatCard label="Platforms Active" value={String(data.platforms.length)} />
        <StatCard label="Social Avg Duration" value={`${data.socialAvgDuration}s`} />
        <StatCard label="Social Bounce Rate" value={`${data.socialBounceRate}%`} />
      </div>

      {/* Publer Data */}
      {publerLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-6 w-48" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      ) : publerError ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Failed to load Publer data</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {publerError instanceof Error ? publerError.message : "Unknown error"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="shrink-0 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : publerData ? (
        <PublerPostPerformance data={publerData} onRefresh={() => refetch()} />
      ) : null}

      {data.totalSocial === 0 ? (
        <PlaceholderCard message="No social media sessions tracked yet. Add UTM parameters to social posts to see data here." />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Platform Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3">Referral Sessions by Platform</h4>
            <ChartContainer config={platformConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="sessions" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Breakdown Table */}
          <div>
            <h4 className="text-sm font-medium mb-3">Referral Breakdown</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Avg Duration</TableHead>
                  <TableHead className="text-right">Bounce %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.platforms.map(p => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{(p?.sessions ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{p.avgDuration}s</TableCell>
                    <TableCell className="text-right">{p.bounceRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Top Campaigns */}
      {data.topCampaigns.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Top UTM Campaigns</h4>
          <div className="space-y-2">
            {data.topCampaigns.slice(0, 5).map(campaign => (
              <div key={campaign.name} className="flex items-center gap-3">
                <span className="text-sm truncate flex-1 min-w-0">{campaign.name}</span>
                <Progress
                  value={
                    data.topCampaigns[0]?.count > 0
                      ? (campaign?.count ?? 0) / data.topCampaigns[0].count * 100
                      : 0
                  }
                  className="w-32 h-2"
                />
                <Badge variant="secondary" className="text-xs">
                  {(campaign?.count ?? 0).toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <InsightsCard insights={insights} variant="action" />
    </div>
  );
};

function PublerPostPerformance({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const totals = data.totals;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Publer Post Performance</h4>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="text-xs gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        <PublerStatCard label="Published" value={totals.published} />
        <PublerStatCard label="Scheduled" value={totals.scheduled} />
        <PublerStatCard label="Likes" value={totals.likes} icon={<Heart className="h-3 w-3 text-pink-500" />} />
        <PublerStatCard label="Comments" value={totals.comments} icon={<MessageCircle className="h-3 w-3 text-blue-500" />} />
        <PublerStatCard label="Shares" value={totals.shares} icon={<Share className="h-3 w-3 text-green-500" />} />
        <PublerStatCard label="Impressions" value={totals.impressions} icon={<EyeIcon className="h-3 w-3 text-purple-500" />} />
        <PublerStatCard label="Clicks" value={totals.clicks} icon={<MousePointer className="h-3 w-3 text-orange-500" />} />
        <PublerStatCard label="Accounts" value={data.accounts.length} />
      </div>

      {data.platformBreakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Posts by Platform</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Published</TableHead>
                <TableHead className="text-right">Scheduled</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.platformBreakdown.map((pb: any) => (
                <TableRow key={pb.platform}>
                  <TableCell className="font-medium">{pb.label}</TableCell>
                  <TableCell className="text-right">{formatNumber(pb.published)}</TableCell>
                  <TableCell className="text-right">{formatNumber(pb.scheduled)}</TableCell>
                  <TableCell className="text-right">{formatNumber(pb.likes)}</TableCell>
                  <TableCell className="text-right">{formatNumber(pb.comments)}</TableCell>
                  <TableCell className="text-right">{formatNumber(pb.shares)}</TableCell>
                  <TableCell className="text-right">{formatNumber(pb.impressions)}</TableCell>
                  <TableCell className="text-right">{formatNumber(pb.clicks)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data.topPosts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Top Performing Posts</h4>
          <div className="space-y-2">
            {data.topPosts.map((post: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {socialPlatformLabels[post.platform] || post.platform}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.text || "Untitled post"}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>❤️ {formatNumber(post.likes)}</span>
                    <span>💬 {formatNumber(post.comments)}</span>
                    <span>🔗 {formatNumber(post.shares)}</span>
                    {(Number(post.impressions) || 0) > 0 && <span>👁 {formatNumber(post.impressions)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PublerStatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          {icon}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className="text-lg font-bold">{formatNumber(value)}</p>
      </CardContent>
    </Card>
  );
}

// ============= MONETIZATION SECTION =============
const AD_UNITS_PER_PAGE = 1.5;
const LOW_CPM = 2;
const HIGH_CPM = 5;

async function fetchAdSenseStatus() {
  return useQuery({
    queryKey: ["google-oauth-status"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { connected: {} };
        const response = await fetch(
          "https://pbmtnvxywplgpldmlygv.supabase.co/functions/v1/google-oauth?action=status",
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        return response.ok ? { connected: (await response.json())?.connected ?? {} } : { connected: {} };
      } catch {
        return { connected: {} };
      }
    },
    staleTime: 60 * 1000,
    retry: false
  });
}

async function authorizeGoogleService(service: string) {
  const response = await fetch(
    `https://pbmtnvxywplgpldmlygv.supabase.co/functions/v1/google-oauth?action=authorize&service=${service}`
  );
  const data = await response.json();
  if (data.url) window.location.href = data.url;
}

async function fetchAdSenseData(startDate: string, endDate: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const response = await fetch(
    `https://pbmtnvxywplgpldmlygv.supabase.co/functions/v1/google-adsense-data?start_date=${startDate}&end_date=${endDate}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } }
  );
  return response.ok ? response.json() : null;
}

function toNum(a: number | string): number {
  const n = typeof a === "number" ? a : Number(a);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(n: number | string): string {
  return toNum(n).toLocaleString();
}

function formatDecimal(n: number | string, decimals = 2): string {
  return toNum(n).toFixed(decimals);
}

export const MonetizationSection = ({ startDate, range }: { startDate: string; range: string }) => {
  const { data: oauthStatus } = useQuery({
    queryKey: ["google-oauth-status"],
    queryFn: getGoogleOAuthStatus,
    staleTime: 60 * 1000,
    retry: false
  });

  const isAdSenseConnected = oauthStatus?.connected?.adsense === true;
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDateFormatted = format(parseISO(startDate), "yyyy-MM-dd");

  const { data: adSenseData } = useQuery({
    queryKey: ["adsense-data", range],
    queryFn: () => fetchAdSenseData(startDateFormatted, endDate),
    enabled: isAdSenseConnected,
    staleTime: 5 * 60 * 1000
  });

  const { data: monetizationData, isLoading } = useQuery({
    queryKey: ["analytics-monetization", range],
    queryFn: async () => {
      const pageviews = await fetchPageviews(startDate);
      const totalViews = pageviews.length;
      const estImpressions = Math.round(totalViews * AD_UNITS_PER_PAGE);
      const daysDiff = differenceInDays(new Date(), parseISO(startDate)) || 1;
      const dailyViews = totalViews / daysDiff;
      const dailyImpressions = estImpressions / daysDiff;
      const dailyRevLow = dailyImpressions / 1000 * LOW_CPM;
      const dailyRevHigh = dailyImpressions / 1000 * HIGH_CPM;
      const monthlyRevLow = dailyRevLow * 30;
      const monthlyRevHigh = dailyRevHigh * 30;

      const pageStats: Record<string, number> = {};
      for (const pv of pageviews) {
        const path = pv.page_path || "/";
        if (!path.includes("__lovable")) {
          pageStats[path] = (pageStats[path] || 0) + 1;
        }
      }

      const topPages = Object.entries(pageStats)
        .map(([path, views]) => ({
          path,
          views,
          estImpressions: Math.round(views * AD_UNITS_PER_PAGE),
          estRevLow: (views * AD_UNITS_PER_PAGE / 1000 * LOW_CPM).toFixed(2),
          estRevHigh: (views * AD_UNITS_PER_PAGE / 1000 * HIGH_CPM).toFixed(2)
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15);

      const dailyStats: Record<string, number> = {};
      for (const pv of pageviews) {
        const dateKey = format(parseISO(pv.viewed_at), "MMM dd");
        dailyStats[dateKey] = (dailyStats[dateKey] || 0) + 1;
      }

      const dailyTrend = Object.entries(dailyStats).map(([date, views]) => ({
        date,
        views,
        estRevLow: parseFloat((views * AD_UNITS_PER_PAGE / 1000 * LOW_CPM).toFixed(2)),
        estRevHigh: parseFloat((views * AD_UNITS_PER_PAGE / 1000 * HIGH_CPM).toFixed(2))
      }));

      return {
        totalPageviews: totalViews,
        estImpressions,
        dailyPageviews: Math.round(dailyViews),
        dailyRevLow: dailyRevLow.toFixed(2),
        dailyRevHigh: dailyRevHigh.toFixed(2),
        monthlyRevLow: monthlyRevLow.toFixed(2),
        monthlyRevHigh: monthlyRevHigh.toFixed(2),
        topPages,
        dailyTrend
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-40 w-full" />
        <LoadingSkeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!monetizationData) return <PlaceholderCard message="Unable to load monetization data." />;

  const data = monetizationData;
  const hasRealData = isAdSenseConnected && adSenseData?.connected;

  const insights: string[] = [];
  if (hasRealData) {
    const earnings = toNum(adSenseData?.totals?.ESTIMATED_EARNINGS);
    insights.push(`1. Real AdSense earnings for this period: $${formatDecimal(earnings)} from account "${adSenseData?.account ?? "unknown"}".`);
  } else if (data.totalPageviews === 0) {
    insights.push("1. No pageview data available yet. Revenue estimates will appear once analytics tracking is active.");
  } else {
    insights.push(
      `1. At ${(data.dailyPageviews ?? 0).toLocaleString()} daily pageviews with ~${AD_UNITS_PER_PAGE} ad units/page, estimated daily revenue is $${data.dailyRevLow}–$${data.dailyRevHigh} (at $${LOW_CPM}–$${HIGH_CPM} RPM for AI/tech content).`
    );

    if (data.topPages.length > 0) {
      const topPage = data?.topPages?.[0]?.path ?? "/";
      const topPageViews = data?.topPages?.[0]?.views ?? 0;
      insights.push(`2. "${topPage}" is your highest-revenue page with ${(topPageViews ?? 0).toLocaleString()} views. Ensure optimal ad placement here.`);
    }

    const monthlyRevLow = Number(data.monthlyRevLow ?? 0);
    if (monthlyRevLow < 50) {
      insights.push(
        `3. Projected monthly revenue ($${data.monthlyRevLow}–$${data.monthlyRevHigh}) is below the AdSense payment threshold of $100. Focus on growing organic traffic.`
      );
    } else {
      insights.push(
        `3. Projected monthly revenue range: $${data.monthlyRevLow}–$${data.monthlyRevHigh}. Focus on long-form articles (1,500+ words) for higher RPMs.`
      );
    }
  }

  const chartConfig = {
    estRevLow: { label: "Est. Rev (Low)", color: "hsl(var(--primary) / 0.5)" },
    estRevHigh: { label: "Est. Rev (High)", color: "hsl(var(--primary))" },
    earnings: { label: "Earnings", color: "hsl(var(--primary))" }
  };

  return (
    <div className="space-y-6">
      {isAdSenseConnected ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 flex items-center gap-2">
          <CircleCheck className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Google AdSense connected — showing real data
          </span>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Google AdSense</p>
            <p className="text-xs text-muted-foreground">
              Connect to see actual revenue, RPM, CPC, and click data
            </p>
          </div>
          <Button size="sm" onClick={() => authorizeGoogleService("adsense")} className="gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            Connect AdSense
          </Button>
        </div>
      )}

      {hasRealData && adSenseData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Revenue" value={`$${formatDecimal(toNum(adSenseData?.totals?.ESTIMATED_EARNINGS))}`} />
            <StatCard label="Impressions" value={formatCurrency(toNum(adSenseData?.totals?.IMPRESSIONS))} />
            <StatCard label="Clicks" value={formatCurrency(toNum(adSenseData?.totals?.CLICKS))} />
            <StatCard label="Page RPM" value={`$${formatDecimal(toNum(adSenseData?.totals?.PAGE_VIEWS_RPM))}`} />
            <StatCard label="CPC" value={`$${formatDecimal(toNum(adSenseData?.totals?.CPC))}`} />
          </div>

          {/* Real AdSense chart would go here */}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Pageviews" value={(data.totalPageviews ?? 0).toLocaleString()} />
            <StatCard label="Est. Impressions" value={(data.estImpressions ?? 0).toLocaleString()} />
            <StatCard label="Daily Rev (Low)" value={`$${data.dailyRevLow}`} />
            <StatCard label="Daily Rev (High)" value={`$${data.dailyRevHigh}`} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Daily Revenue Trend</h4>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="estRevLow"
                    fill="hsl(var(--primary) / 0.1)"
                    stroke="hsl(var(--primary) / 0.5)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="estRevHigh"
                    fill="hsl(var(--primary) / 0.2)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {data.topPages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Top Pages by Est. Revenue</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Est. Impressions</TableHead>
                    <TableHead className="text-right">Est. Revenue (Low)</TableHead>
                    <TableHead className="text-right">Est. Revenue (High)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topPages.map(page => (
                    <TableRow key={page.path}>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">{page.path}</TableCell>
                      <TableCell className="text-right">{(page.views ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{(page.estImpressions ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">${page.estRevLow}</TableCell>
                      <TableCell className="text-right">${page.estRevHigh}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <InsightsCard insights={insights} />
    </div>
  );
};

// ============= SEO SECTION =============
export const SEOSection = ({ startDate, range }: { startDate: string; range: string }) => {
  const { data: oauthStatus } = useQuery({
    queryKey: ["google-oauth-status"],
    queryFn: getGoogleOAuthStatus,
    staleTime: 60 * 1000,
    retry: false
  });

  const isGSCConnected = oauthStatus?.connected?.search_console === true;
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDateFormatted = format(parseISO(startDate), "yyyy-MM-dd");

  const { data: gscQueries } = useQuery({
    queryKey: ["gsc-queries", range],
    queryFn: async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return null;
      const response = await fetch(
        `https://pbmtnvxywplgpldmlygv.supabase.co/functions/v1/google-search-console?site_url=sc-domain:aiinasia.com&start_date=${startDateFormatted}&end_date=${endDate}&dimension=query`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.ok ? response.json() : null;
    },
    enabled: isGSCConnected,
    staleTime: 5 * 60 * 1000
  });

  const { data: gscPages } = useQuery({
    queryKey: ["gsc-pages", range],
    queryFn: async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return null;
      const response = await fetch(
        `https://pbmtnvxywplgpldmlygv.supabase.co/functions/v1/google-search-console?site_url=sc-domain:aiinasia.com&start_date=${startDateFormatted}&end_date=${endDate}&dimension=page`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.ok ? response.json() : null;
    },
    enabled: isGSCConnected,
    staleTime: 5 * 60 * 1000
  });

  const { data: gscTrend } = useQuery({
    queryKey: ["gsc-trend", range],
    queryFn: async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return null;
      const response = await fetch(
        `https://pbmtnvxywplgpldmlygv.supabase.co/functions/v1/google-search-console?site_url=sc-domain:aiinasia.com&start_date=${startDateFormatted}&end_date=${endDate}&dimension=date`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.ok ? response.json() : null;
    },
    enabled: isGSCConnected,
    staleTime: 5 * 60 * 1000
  });

  const { data: seoData, isLoading } = useQuery({
    queryKey: ["analytics-seo-performance", range],
    queryFn: async () => {
      const now = new Date().toISOString();
      const [sessionRecords, totalRes] = await Promise.all([
        fetchOrganiicSessions(startDate),
        supabase.rpc("get_total_sessions", { p_start: startDate, p_end: now })
      ]);

      const totalSessions = (totalRes.error ? null : totalRes.data) ?? sessionRecords.length;
      differenceInDays(new Date(), parseISO(startDate));

      const organicSessions = [];
      const searchEngines: Record<string, number> = {};
      const landingPages: Record<string, number> = {};
      const dailyStats: Record<string, number> = {};

      for (const session of sessionRecords) {
        const dateKey = format(parseISO(session.started_at), "MMM dd");
        dailyStats[dateKey] = (dailyStats[dateKey] || 0) + 1;

        const engine = detectSearchEngine(session.referrer_domain || "");
        if (engine) {
          organicSessions.push(session);
          searchEngines[engine] = (searchEngines[engine] || 0) + 1;

          const landingPage = session.landing_page || "/";
          if (!landingPage.includes("__lovable")) {
            landingPages[landingPage] = (landingPages[landingPage] || 0) + 1;
          }
        }
      }

      const organicCount = organicSessions.length;
      const organicPct = totalSessions > 0 ? (organicCount / totalSessions * 100).toFixed(1) : "0";
      const avgDuration =
        organicCount > 0
          ? Math.round(
              organicSessions.reduce((acc, s) => acc + Math.min(s.duration_seconds ?? 0, 1800), 0) / organicCount
            )
          : 0;
      const bounceRate =
        organicCount > 0
          ? Math.round(organicSessions.filter(s => s.is_bounce).length / organicCount * 100)
          : 0;

      const engineBreakdown = Object.entries(searchEngines)
        .map(([name, count]) => ({
          name,
          count,
          pct: organicCount > 0 ? Math.round(count / organicCount * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      const topLandingPages = Object.entries(landingPages)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      const dailyOrganicTrend = Object.keys(dailyStats)
        .sort()
        .map(date => ({
          date,
          organic: organicSessions.filter(s => format(parseISO(s.started_at), "MMM dd") === date).length,
          other: (dailyStats[date] || 0) - organicSessions.filter(s => format(parseISO(s.started_at), "MMM dd") === date).length
        }));

      const preFixSessions = organicSessions.filter(s => s.started_at < PRERENDER_FIX_DATE).length;
      const postFixSessions = organicSessions.filter(s => s.started_at >= PRERENDER_FIX_DATE).length;
      const preFixDays = Math.max(1, differenceInDays(parseISO(PRERENDER_FIX_DATE), parseISO(startDate)));
      const postFixDays = Math.max(1, differenceInDays(new Date(), parseISO(PRERENDER_FIX_DATE)));
      const preFixDaily = preFixSessions / preFixDays;
      const postFixDaily = postFixSessions / postFixDays;
      const recoveryChange = preFixDaily > 0 ? Math.round(((postFixDaily - preFixDaily) / preFixDaily) * 100) : postFixDaily > 0 ? 100 : 0;

      return {
        totalSessions,
        totalOrganic: organicCount,
        organicPct,
        organicAvgDuration: avgDuration,
        organicBounceRate: bounceRate,
        engines: engineBreakdown,
        topLandingPages,
        dailyTrend: dailyOrganicTrend,
        recoveryPctChange: recoveryChange,
        preFixDaily: Math.round(preFixDaily * 10) / 10,
        postFixDaily: Math.round(postFixDaily * 10) / 10
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-40 w-full" />
        <LoadingSkeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!seoData) return <PlaceholderCard message="Unable to load SEO data." />;

  const data = seoData;
  const organicVsNonOrganic =
    data.totalSessions > 0
      ? [
          { name: "Organic", value: data.totalOrganic, fill: "hsl(var(--primary))" },
          { name: "Non-Organic", value: data.totalSessions - data.totalOrganic, fill: "hsl(var(--muted-foreground) / 0.3)" }
        ]
      : [];

  const chartConfig = {
    organic: { label: "Organic", color: "hsl(var(--primary))" },
    other: { label: "Other Traffic", color: "hsl(var(--muted-foreground) / 0.3)" },
    clicks: { label: "Clicks", color: "hsl(var(--primary))" },
    impressions: { label: "Impressions", color: "hsl(var(--primary) / 0.4)" }
  };

  const insights: string[] = [];
  if (data.totalOrganic === 0) {
    insights.push(
      "1. No organic search traffic detected. The prerender fix deployed March 21, 2026 enables Google indexing — expect organic sessions to appear within 2-4 weeks as pages are crawled and indexed."
    );
    insights.push("2. Submit your sitemap to Google Search Console and Bing Webmaster Tools to accelerate discovery.");
  } else {
    insights.push(
      `1. Organic search accounts for ${data.organicPct}% of traffic (${(data.totalOrganic ?? 0).toLocaleString()} sessions). ${Number.parseFloat(data.organicPct ?? "0") < 30 ? "Industry benchmark for content sites is 40-60% organic — focus on SEO-optimized titles and meta descriptions." : "This is a healthy organic share. Maintain momentum with regular content updates."}`
    );

    if (data.recoveryPctChange !== 0) {
      const emoji = data.recoveryPctChange > 0 ? "📈" : "📉";
      insights.push(
        `2. Post-prerender fix (Mar 21): organic traffic ${data.recoveryPctChange > 0 ? "increased" : "decreased"} ${emoji} by ${Math.abs(data.recoveryPctChange)}% (${data.preFixDaily}/day → ${data.postFixDaily}/day). ${data.recoveryPctChange > 0 ? "Recovery is on track — full indexing typically takes 4-8 weeks." : "Allow 4-8 weeks for full re-indexing. Monitor Search Console for crawl errors."}`
      );
    }

    if (data.topLandingPages.length > 0) {
      const topPage = data.topLandingPages[0];
      insights.push(
        `3. Top organic landing page "${topPage.path}" has ${(topPage?.count ?? 0).toLocaleString()} sessions. Strengthen this page with internal links from related articles, and add structured data (FAQ schema, HowTo) to boost SERP visibility.`
      );
    }
  }

  return (
    <div className="space-y-6">
      {isGSCConnected ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 flex items-center gap-2">
          <CircleCheck className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Google Search Console connected
          </span>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Google Search Console</p>
            <p className="text-xs text-muted-foreground">
              Connect to see real keyword data, CTR, and average position
            </p>
          </div>
          <Button size="sm" onClick={() => authorizeGoogleService("search_console")} className="gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            Connect Search Console
          </Button>
        </div>
      )}

      {/* GSC Real Data Section - placeholder */}
      {isGSCConnected && gscQueries?.rows && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="GSC Total Clicks"
              value={formatCurrency(toNum(gscQueries?.totals?.clicks))}
            />
            <StatCard
              label="GSC Total Impressions"
              value={formatCurrency(toNum(gscQueries?.totals?.impressions))}
            />
            <StatCard
              label="Avg CTR"
              value={`${toNum(gscQueries?.totals?.impressions) > 0 ? formatDecimal(toNum(gscQueries?.totals?.clicks) / toNum(gscQueries?.totals?.impressions) * 100) : "0"}%`}
            />
            <StatCard
              label="Avg Position"
              value={
                (gscQueries?.rows?.length ?? 0) > 0
                  ? formatDecimal(gscQueries.rows.reduce((acc: number, r: any) => acc + toNum(r?.position), 0) / gscQueries.rows.length)
                  : "N/A"
              }
            />
          </div>

          {/* GSC Charts and Tables would go here */}
        </div>
      )}

      {/* Analytics Organic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Organic Sessions"
          value={(data.totalOrganic ?? 0).toLocaleString()}
          sub={`${data.organicPct}% of total`}
        />
        <StatCard label="Organic Avg Duration" value={`${data.organicAvgDuration}s`} />
        <StatCard label="Organic Bounce Rate" value={`${data.organicBounceRate}%`} />
        <StatCard
          label="SEO Recovery"
          value={`${data.recoveryPctChange > 0 ? "+" : ""}${data.recoveryPctChange}%`}
          sub="vs pre-fix daily avg"
        />
      </div>

      {data.totalOrganic === 0 ? (
        <PlaceholderCard message="No organic search sessions detected yet. Allow 2-4 weeks after the prerender fix for Google to index your pages." />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Organic vs Non-Organic Donut */}
          <div>
            <h4 className="text-sm font-medium mb-3">Organic vs Non-Organic Split</h4>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={organicVsNonOrganic}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {organicVsNonOrganic.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-2">
              {organicVsNonOrganic.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                  <span>
                    {entry.name}: {(entry?.value ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Engine Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Search Engine Breakdown</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Engine</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.engines.map(engine => (
                  <TableRow key={engine.name}>
                    <TableCell className="font-medium">{engine.name}</TableCell>
                    <TableCell className="text-right">
                      {(engine?.count ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{engine.pct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Daily Organic Trend */}
      {data.dailyTrend.length > 1 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Daily Organic Traffic Trend</h4>
          <ChartContainer config={chartConfig} className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="organic"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {/* Top Organic Landing Pages */}
      {data.topLandingPages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Top Organic Landing Pages</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Organic Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topLandingPages.map(page => (
                  <TableRow key={page.path}>
                    <TableCell className="font-medium text-xs max-w-[300px] truncate">
                      {page.path}
                    </TableCell>
                    <TableCell className="text-right">
                      {(page?.count ?? 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!isGSCConnected && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            Connect Google Search Console API for keyword data, CTR, average position, and crawl analytics.
          </span>
        </div>
      )}

      <InsightsCard insights={insights} variant="highlight" />
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AnalyticsAllPage() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  // Calculate start date
  const startDate = useMemo(() => {
    const now = new Date();
    const daysBack = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    return start.toISOString();
  }, [dateRange]);

  // Fetch session stats
  const {
    data: sessionStats,
    isLoading: statsLoading,
    isError: statsError,
  } = useSessionStats(startDate, dateRange);

  // Fetch extra stats
  const { data: extraStats, isLoading: extraLoading } = useQuery({
    queryKey: ["analytics-hub-extra-stats", dateRange],
    queryFn: async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const [completionsRes, subscribersRes, activeRes] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .eq("event_name", "article_complete")
          .gte("created_at", startDate),
        supabase
          .from("newsletter_subscribers")
          .select("id", { count: "exact", head: true })
          .eq("confirmed", true)
          .is("unsubscribed_at", null),
        supabase
          .from("analytics_sessions")
          .select("id", { count: "exact", head: true })
          .gte("started_at", fifteenMinutesAgo),
      ]);

      return {
        completions: completionsRes.count ?? 0,
        subscribers: subscribersRes.count ?? 0,
        activeNow: activeRes.count ?? 0,
      };
    },
    staleTime: 60000,
  });

  const isLoading = (statsLoading && !statsError) || extraLoading;
  const totalSessions = sessionStats?.totalSessions ?? 0;
  const uniqueVisitors = sessionStats?.uniqueVisitors ?? 0;

  // Format number helper
  const formatNumber = (value: number | null | undefined): string => {
    if (value == null) return "N/A";
    return value.toLocaleString();
  };

  // Top metrics array
  const topMetrics = [
    {
      label: "Total Sessions",
      value: formatNumber(sessionStats?.totalSessions),
      icon: Activity,
      color: "text-blue-500",
    },
    {
      label: "Unique Visitors",
      value: formatNumber(sessionStats?.uniqueVisitors),
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Avg Engagement (s)",
      value: formatNumber(sessionStats?.avgEngagement),
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      label: "Article Completions",
      value: formatNumber(extraStats?.completions),
      icon: BookCheck,
      color: "text-purple-500",
    },
    {
      label: "Newsletter Subscribers",
      value: formatNumber(extraStats?.subscribers),
      icon: Mail,
      color: "text-pink-500",
    },
    {
      label: "Active Now",
      value: formatNumber(extraStats?.activeNow),
      icon: Activity,
      color: "text-cyan-500",
    },
  ];

  // Sections array - IN ORDER
  const sections = [
    {
      id: "completions",
      title: "Article & Guide Completions",
      icon: BookCheck,
      color: "text-purple-500",
      component: <CompletionsSection startDate={startDate} range={dateRange} />,
    },
    {
      id: "new-users",
      title: "New Users & Real-time",
      icon: UserPlus,
      color: "text-green-500",
      component: <NewUsersSection startDate={startDate} range={dateRange} totalSessions={totalSessions} />,
    },
    {
      id: "returning",
      title: "Returning Users & Stickiness",
      icon: UserCheck,
      color: "text-blue-500",
      component: <ReturningUsersSection startDate={startDate} range={dateRange} totalSessions={totalSessions} uniqueVisitors={uniqueVisitors} />,
    },
    {
      id: "audience",
      title: "Audience & Acquisition",
      icon: Globe,
      color: "text-teal-500",
      component: <AudienceSection startDate={startDate} range={dateRange} totalSessions={totalSessions} />,
    },
    {
      id: "social",
      title: "Social Media Performance",
      icon: Share2,
      color: "text-sky-500",
      component: <SocialMediaSection startDate={startDate} range={dateRange} />,
    },
    {
      id: "monetization",
      title: "Monetization / AdSense",
      icon: DollarSign,
      color: "text-emerald-500",
      component: <MonetizationSection startDate={startDate} range={dateRange} />,
    },
    {
      id: "seo",
      title: "SEO / Search Performance",
      icon: Search,
      color: "text-indigo-500",
      component: <SEOSection startDate={startDate} range={dateRange} />,
    },
    {
      id: "rankings",
      title: "Content Rankings",
      icon: Trophy,
      color: "text-yellow-500",
      component: <ContentRankingsSection startDate={startDate} range={dateRange} />,
    },
    {
      id: "navigation",
      title: "Navigation & User Flows",
      icon: RouteIcon,
      color: "text-orange-500",
      component: <NavigationSection startDate={startDate} range={dateRange} />,
    },
    {
      id: "cta",
      title: "CTA & Newsletter",
      icon: Mail,
      color: "text-pink-500",
      component: <CTANewsletterSection startDate={startDate} range={dateRange} />,
    },
    {
      id: "briefing",
      title: "3 Before 9 Performance",
      icon: Newspaper,
      color: "text-cyan-500",
      component: <BriefingSection startDate={startDate} range={dateRange} />,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="container mx-auto px-4 py-8 text-base">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Analytics Hub</h1>
            <p className="text-gray-600 mt-2">Unified view of all site analytics</p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setDateRange(range)}
                className="text-xs px-4"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Top Metrics Grid - 6 columns with larger font */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {topMetrics.map((metric) => {
            const MetricIcon = metric.icon;
            return (
              <Card key={metric.label} className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <MetricIcon className={`h-4 w-4 ${metric.color}`} />
                        <span className="text-xs text-gray-600 truncate">{metric.label}</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sections - 11 sections in order */}
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              title={section.title}
              icon={section.icon}
              iconColor={section.color}
            >
              {section.component}
            </SectionCard>
          ))}
        </div>
      </main>
    </div>
  );
}
