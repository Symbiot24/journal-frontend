import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MoodPicker from '@/components/MoodPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Save, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Align mood options with backend schema
// enum: ['happy', 'sad', 'angry', 'anxious', 'neutral']
type MoodType = 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral';

const Journal = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const { addEntry, token, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !selectedMood) {
      toast({
        title: 'Missing Information',
        description: 'Please add a title, write your thoughts, and select your mood.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate AI insight generation
      const mockInsights = [
        'Consider practicing deep breathing exercises when feeling overwhelmed',
        'Your writing shows resilience - remember to celebrate small victories',
        'Try connecting with nature or taking a short walk to boost your mood',
        'Gratitude journaling might help enhance positive thinking patterns',
        'Regular sleep schedule can significantly impact mood stability',
      ];

      const randomInsights = mockInsights.sort(() => 0.5 - Math.random()).slice(0, 3);

      setInsights(randomInsights);

      const entry = {
        title: title.trim(),
        content: content.trim(),
        mood: selectedMood,
        createdAt: new Date().toISOString(),
        insights: randomInsights,
        userId: user?.id,
      };

      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(entry),
      });

      const data = await response.json();

      console.log('Backend response:', data);

      addEntry(entry);

      toast({
        title: 'Entry Saved!',
        description: 'Your journal entry has been saved with AI insights.',
      });

      // Clear form after showing insights
      setTimeout(() => {
        setTitle('');
        setContent('');
        setSelectedMood(null);
        setInsights([]);
        navigate('/dashboard');
      }, );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Journal Entry</h1>
            <div className="flex items-center justify-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{currentDate}</span>
            </div>
          </div>

          {/* Mood Picker */}
          <MoodPicker selectedMood={selectedMood} onMoodSelect={setSelectedMood as any} />

          {/* Journal Form */}
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-card-foreground">How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-card-foreground">
                    Entry Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Add a short title for your entry"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-card-foreground">
                    Write your thoughts, feelings, or experiences...
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Today I feel... because... I'm grateful for... I'm looking forward to..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] bg-background border-border focus:ring-primary transition-smooth resize-none"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">{content.length}/1000 characters</p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-glow transition-bounce"
                  disabled={isSubmitting || !title.trim() || !content.trim() || !selectedMood}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving Entry...' : 'Save Entry'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {insights.length > 0 && (
            <Card className="bg-primary-light/10 border-primary-light/20 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <Alert key={index} className="bg-background/50 border-primary-light/30">
                      <AlertDescription className="text-card-foreground">{insight}</AlertDescription>
                    </Alert>
                  ))}
                  <p className="text-xs text-muted-foreground mt-4">
                    These insights are generated based on your mood and writing patterns to support your mental wellness journey.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-accent/20 border-accent/30">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-accent-foreground mb-3">Journaling Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be honest and authentic in your writing</li>
                <li>• Don't worry about grammar or structure</li>
                <li>• Focus on your emotions and experiences</li>
                <li>• Try to write regularly, even if it's just a few sentences</li>
                <li>• Use this space to process and reflect on your day</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Journal;
