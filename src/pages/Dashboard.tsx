import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import EntryCard from '@/components/EntryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Heart, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user, entries, fetchEntries } = useAuth();

  useEffect(() => {
    fetchEntries();
  }, []);

  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateStreak = () => {
    if (!entries || entries.length === 0) return 0;

    const daysWithEntries = new Set<string>();
    for (const entry of entries) {
      const d = new Date(entry.createdAt);
      daysWithEntries.add(getLocalDateKey(d));
    }

    const today = new Date();
    let current = new Date(today);
    let streakCount = 0;

    // Streak must include today; otherwise it's 0
    if (!daysWithEntries.has(getLocalDateKey(current))) {
      return 0;
    }

    while (daysWithEntries.has(getLocalDateKey(current))) {
      streakCount += 1;
      current.setDate(current.getDate() - 1);
    }

    return streakCount;
  };

  const streak = calculateStreak();

  const moodData = [
    { name: 'Happy', value: entries.filter((e) => e.mood === 'happy').length, color: 'hsl(var(--mood-happy))' },
    { name: 'Angry', value: entries.filter((e) => e.mood === 'angry').length, color: 'hsl(var(--destructive))' },
    { name: 'Neutral', value: entries.filter((e) => e.mood === 'neutral').length, color: 'hsl(var(--mood-neutral))' },
    { name: 'Anxious', value: entries.filter((e) => e.mood === 'anxious').length, color: 'hsl(var(--mood-anxious))' },
    { name: 'Sad', value: entries.filter((e) => e.mood === 'sad').length, color: 'hsl(var(--mood-sad))' },
  ].filter((item) => item.value > 0);

  // Weekly trend based on unique days (multiple entries in the same day count as one)
  const trendData = (() => {
    if (!entries || entries.length === 0) return [] as { day: string; mood: number }[];

    const toScore = (mood: string) => (mood === 'happy' ? 5 : mood === 'neutral' ? 3 : mood === 'anxious' || mood === 'angry' ? 2 : 1);

    // Preserve the order of appearance (entries are assumed newest-first)
    const uniqueDayKeys: string[] = [];
    const dayToScores = new Map<string, number[]>();
    for (const entry of entries) {
      const key = getLocalDateKey(new Date(entry.createdAt));
      if (!dayToScores.has(key)) {
        uniqueDayKeys.push(key);
        dayToScores.set(key, []);
      }
      dayToScores.get(key)!.push(toScore(entry.mood));
    }

    // Take last 7 unique days (most recent first), then reverse to oldest->newest for chart
    const lastSevenKeysNewestFirst = uniqueDayKeys.slice(0, 7);
    const keysOldestToNewest = [...lastSevenKeysNewestFirst].reverse();

    return keysOldestToNewest.map((key, idx) => {
      const scores = dayToScores.get(key) || [3];
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        day: `Day ${idx + 1}`,
        mood: Number(avg.toFixed(2)),
      };
    });
  })();

  const computeMoodTrend = () => {
    const recent = entries.slice(0, 7).reverse(); // oldest -> newest
    if (recent.length < 2) {
      return { label: 'No data', colorClass: 'text-muted-foreground' } as const;
    }

    const toScore = (mood: string) => (mood === 'happy' ? 5 : mood === 'neutral' ? 3 : mood === 'anxious' || mood === 'sad' ? 2 : 1);

    // Simple linear regression slope to determine trend direction
    const xVals = recent.map((_, i) => i + 1);
    const yVals = recent.map((e) => toScore(e.mood));
    const n = xVals.length;
    const sumX = xVals.reduce((a, b) => a + b, 0);
    const sumY = yVals.reduce((a, b) => a + b, 0);
    const sumXY = xVals.reduce((acc, x, i) => acc + x * yVals[i], 0);
    const sumXX = xVals.reduce((acc, x) => acc + x * x, 0);
    const denominator = n * sumXX - sumX * sumX;
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;

    const threshold = 0.1; // small threshold to avoid noise
    if (slope > threshold) {
      return { label: 'Improving', colorClass: 'text-success' } as const;
    }
    if (slope < -threshold) {
      return { label: 'Declining', colorClass: 'text-destructive' } as const;
    }
    return { label: 'Stable', colorClass: 'text-warning' } as const;
  };

  const moodTrend = computeMoodTrend();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
              <p className="text-primary-foreground/80">
                How are you feeling today? Your mental wellness journey continues here.
              </p>
            </div>
            <Brain className="h-16 w-16 text-primary-foreground/20" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Entries</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{entries.length}</div>
              <p className="text-xs text-muted-foreground">
                Entries journal by you
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Mood Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${moodTrend.colorClass}`}>{moodTrend.label}</div>
              <p className="text-xs text-muted-foreground">
                Based on recent entries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Streak</CardTitle>
              <Brain className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{streak} {streak === 1 ? 'day' : 'days'}</div>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-card-foreground">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Start journaling to see your mood patterns
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-card-foreground">Weekly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Create more entries to see trends
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Recent Entries</h2>
          <div className="flex gap-2">
            <Link to="/entries">
              <Button variant="secondary" className="transition-bounce">
                Manage Entries
              </Button>
            </Link>
            <Link to="/journal">
              <Button className="bg-gradient-primary hover:shadow-glow transition-bounce">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {entries.length > 0 ? (
            entries.slice(0, 6).map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="bg-gradient-card shadow-card border-0 p-8 text-center">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Start Your Journey
                </h3>
                <p className="text-muted-foreground mb-4">
                  Write your first journal entry to begin tracking your mental wellness.
                </p>
                <Link to="/journal">
                  <Button className="bg-gradient-primary hover:shadow-glow transition-bounce">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Write First Entry
                  </Button>
                </Link>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;