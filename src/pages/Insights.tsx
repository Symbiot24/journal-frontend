import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Heart, Lightbulb, Target, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

const Insights = () => {
  const { entries, fetchEntries, user, token } = useAuth();

  const [personalizedInsights, setPersonalizedInsights] = useState<Array<{
    title: string;
    description: string;
    type?: string;
    severity?: string;
  }>>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    const fetchPersonalizedInsights = async () => {
      try {
        setIsLoadingInsights(true);
        setInsightsError(null);

        const baseUrl = `${import.meta.env.VITE_APP_API_URL}/insights/summary`;
        const url = user?.id ? `${baseUrl}?userId=${encodeURIComponent(user.id)}` : baseUrl;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to fetch insights');
        }

        const data = await response.json();
        // Backend example: { success: true, data: { insights: [...] } }
        const root = data?.data ?? data;
        const candidates = Array.isArray(root)
          ? root
          : Array.isArray(root?.insights)
            ? root.insights
            : Array.isArray(root?.items)
              ? root.items
              : root
                ? [root]
                : [];

        const mapped = candidates.map((item: any) => {
          const description = item?.description || item?.text || item?.message || '';
          const titleFromItem = item?.title || item?.heading || '';
          const title = titleFromItem || (description ? String(description).slice(0, 80) + (String(description).length > 80 ? '…' : '') : 'Insight');
          const type = item?.type || item?.category || item?.kind || undefined;
          const rawSeverity = (item?.severity || item?.level || '').toString().toLowerCase();
          let severity: string | undefined = undefined;
          if (rawSeverity) {
            if (['low', 'info', 'information', 'notice'].includes(rawSeverity)) severity = 'info';
            else if (['medium', 'warn', 'warning'].includes(rawSeverity)) severity = 'warning';
            else if (['high', 'good', 'positive', 'success'].includes(rawSeverity)) severity = 'success';
            else severity = rawSeverity;
          }
          return { title, description, type, severity };
        });

        setPersonalizedInsights(mapped.slice(0, 6));
      } catch (e: any) {
        setInsightsError(e?.message || 'Failed to load insights');
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchPersonalizedInsights();
  }, [user?.id, token]);

  // Generate mood trend data
  const moodTrendData = entries.slice(0, 14).reverse().map((entry) => {
    const moodScore: Record<string, number> = {
      happy: 5,
      neutral: 3,
      anxious: 2,
      sad: 2,
      angry: 1,
    };

    return {
      date: new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: moodScore[entry.mood],
      moodName: entry.mood,
    };
  });

  // Generate weekly mood distribution
  const weeklyMoodData = [
    { mood: 'Happy', count: entries.filter((e) => e.mood === 'happy').length, color: 'hsl(var(--mood-happy))' },
    { mood: 'Angry', count: entries.filter((e) => e.mood === 'angry').length, color: 'hsl(var(--destructive))' },
    { mood: 'Neutral', count: entries.filter((e) => e.mood === 'neutral').length, color: 'hsl(var(--mood-neutral))' },
    { mood: 'Anxious', count: entries.filter((e) => e.mood === 'anxious').length, color: 'hsl(var(--mood-anxious))' },
    { mood: 'Sad', count: entries.filter((e) => e.mood === 'sad').length, color: 'hsl(var(--mood-sad))' },
  ];

  // Compute happiest (best average mood) journaling day
  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const bestMoodDayLabel = (() => {
    if (!entries || entries.length === 0) return '—';

    const moodScore: Record<string, number> = {
      happy: 5,
      neutral: 3,
      anxious: 2,
      sad: 1,
      angry: 2,
    };

    const dayToScores = new Map<string, number[]>();
    for (const entry of entries) {
      const d = new Date(entry.createdAt);
      const key = getLocalDateKey(d);
      const score = moodScore[entry.mood] ?? 3;
      const list = dayToScores.get(key) || [];
      list.push(score);
      dayToScores.set(key, list);
    }

    let bestKey: string | null = null;
    let bestAvg = -Infinity;
    for (const [key, scores] of dayToScores.entries()) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestKey = key;
      }
    }

    if (!bestKey) return '—';
    const [y, m, d] = bestKey.split('-').map((n) => parseInt(n, 10));
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    // Show weekday name with month/day, e.g., Monday (Oct 3)
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const md = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${weekday} (${md})`;
  })();

  const getIconForInsight = (type?: string, severity?: string) => {
    const loweredType = (type || '').toLowerCase();
    const loweredSeverity = (severity || '').toLowerCase();
    if (loweredType.includes('recent')) return Lightbulb;
    if (loweredType.includes('pattern') && loweredType.includes('mood')) return TrendingUp;
    if (loweredType.includes('pattern') && loweredType.includes('time')) return Calendar;
    if (loweredType.includes('pattern') && loweredType.includes('topics')) return Brain;
    if (loweredType.includes('positive')) return Heart;
    if (loweredType.includes('goal') || loweredType.includes('target')) return Target;
    if (loweredSeverity === 'success') return TrendingUp;
    if (loweredSeverity === 'warning') return Brain;
    return Lightbulb;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'info': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Your Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of your mental wellness journey
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Mood</p>
                  <p className="text-2xl font-bold text-primary">
                    {entries.length > 0 ? (
                      entries.reduce((acc, entry) => {
                        const scores: Record<string, number> = { happy: 5, neutral: 3, anxious: 2, sad: 1, angry: 2 };
                        return acc + scores[entry.mood];
                      }, 0) / entries.length
                    ).toFixed(1) : '0'}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entries This Week</p>
                  <p className="text-2xl font-bold text-success">{entries.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-success/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Mood Day</p>
                  <p className="text-2xl font-bold text-warning">{bestMoodDayLabel}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Insights Generated</p>
                  <p className="text-2xl font-bold text-accent-foreground">{personalizedInsights.length}</p>
                </div>
                <Brain className="h-8 w-8 text-accent/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-card-foreground">Mood Trend (14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {moodTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Add more entries to see your mood trends
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-card-foreground">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyMoodData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyMoodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border))" />
                    <XAxis dataKey="mood" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Start journaling to see mood patterns
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personalized Insights */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Lightbulb className="h-6 w-6 mr-2 text-primary" />
            Personalized Insights
          </h2>
          {isLoadingInsights && (
            <div className="mb-4 text-sm text-muted-foreground">Loading personalized insights…</div>
          )}
          {insightsError && (
            <div className="mb-4 text-sm text-warning">{insightsError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalizedInsights.map((insight, index) => {
              const IconComponent = getIconForInsight(insight.type, insight.severity);
              return (
                <Card key={index} className={`${getSeverityColor(insight.severity)} shadow-card border transition-smooth hover:shadow-glow`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5" />
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{insight.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;