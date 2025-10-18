import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, BookMarked, Award, Zap } from 'lucide-react';

interface UserStats {
  points: number;
  level: string;
  streak_days: number;
  articles_read: number;
  comments_made: number;
  shares_made: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  earned_at?: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      setStats(statsData);

      // Fetch ALL achievements
      const { data: allAchievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      // Fetch user's earned achievements
      const { data: earnedAchievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user!.id);

      // Map all achievements with earned status
      const earnedMap = new Map(
        earnedAchievementsData?.map(ea => [ea.achievement_id, ea.earned_at]) || []
      );

      setAchievements(allAchievementsData?.map(achievement => ({
        ...achievement,
        earned_at: earnedMap.get(achievement.id)
      })) || []);

      // Fetch bookmarks with article details
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('*, articles(title, slug, excerpt, featured_image_url)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      setBookmarks(bookmarksData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelInfo = (level: string) => {
    const levels = {
      explorer: { name: 'Explorer', color: 'bg-blue-500', next: 'Enthusiast', pointsNeeded: 100 },
      enthusiast: { name: 'Enthusiast', color: 'bg-purple-500', next: 'Expert', pointsNeeded: 500 },
      expert: { name: 'Expert', color: 'bg-orange-500', next: 'Thought Leader', pointsNeeded: 1000 },
      thought_leader: { name: 'Thought Leader', color: 'bg-red-500', next: null, pointsNeeded: null }
    };
    return levels[level as keyof typeof levels] || levels.explorer;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const levelInfo = getLevelInfo(stats?.level || 'explorer');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Stats Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{user?.email}</h1>
              <Badge className={`${levelInfo.color} text-white`}>
                {levelInfo.name}
              </Badge>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-2xl font-bold">{stats?.points || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-2xl font-bold">{stats?.streak_days || 0} days</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <BookMarked className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Articles Read</p>
                  <p className="text-2xl font-bold">{stats?.articles_read || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">
                    {achievements.filter(a => a.earned_at).length}/{achievements.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookmarks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Reading Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks" className="space-y-4">
            {bookmarks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No bookmarks yet. Start saving articles!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <a href={`/article/${bookmark.articles.slug}`}>
                      {bookmark.articles.featured_image_url && (
                        <img 
                          src={bookmark.articles.featured_image_url} 
                          alt={bookmark.articles.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{bookmark.articles.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{bookmark.articles.excerpt}</p>
                      </div>
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => {
                const isEarned = !!achievement.earned_at;
                return (
                  <Card 
                    key={achievement.id} 
                    className={`p-6 transition-all ${
                      isEarned 
                        ? 'border-primary/50 shadow-md' 
                        : 'opacity-50 grayscale border-dashed'
                    }`}
                  >
                    <div className={`text-4xl mb-3 ${!isEarned && 'opacity-40'}`}>
                      {achievement.badge_icon}
                    </div>
                    <h3 className={`font-semibold text-lg mb-2 ${!isEarned && 'text-muted-foreground'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {isEarned ? (
                      <p className="text-xs text-primary font-medium">
                        ✓ Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        🔒 Not yet unlocked
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Articles Read</span>
                    <span className="font-semibold">{stats?.articles_read || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Comments Made</span>
                    <span className="font-semibold">{stats?.comments_made || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Articles Shared</span>
                    <span className="font-semibold">{stats?.shares_made || 0}</span>
                  </div>
                </div>
                {levelInfo.next && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Next Level: {levelInfo.next}
                    </p>
                    <p className="text-sm">
                      {levelInfo.pointsNeeded! - (stats?.points || 0)} points to go
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;