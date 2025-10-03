import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Lightbulb, Edit, Trash2 } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral';
  createdAt: string;
  insights?: string[];
}

interface EntryCardProps {
  entry: JournalEntry;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onEdit, onDelete }) => {
  const moodEmojis = {
    happy: '😊',
    neutral: '😐',
    anxious: '😰',
    sad: '😢',
    angry: '😠',
  };

  const moodColors = {
    happy: 'bg-mood-happy text-foreground',
    neutral: 'bg-mood-neutral text-foreground',
    anxious: 'bg-mood-anxious text-foreground',
    sad: 'bg-mood-sad text-foreground',
    angry: 'bg-destructive text-destructive-foreground',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-glow transition-smooth border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge className={moodColors[entry.mood]} variant="secondary">
              {moodEmojis[entry.mood]} {entry.mood}
            </Badge>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(entry.createdAt)}
            </div>
          </div>
          <div className="flex space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry.id)}
                className="hover:bg-accent transition-smooth"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry.id)}
                className="hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {entry.title && (
          <h3 className="text-lg font-semibold text-card-foreground mt-2">{entry.title}</h3>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-card-foreground leading-relaxed">
          {entry.content.length > 200 
            ? `${entry.content.substring(0, 200)}...` 
            : entry.content
          }
        </p>

        {entry.insights && entry.insights.length > 0 && (
          <div className="bg-primary-light/10 rounded-lg p-3 border border-primary-light/20">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Insights</span>
            </div>
            <ul className="space-y-1">
              {entry.insights.slice(0, 2).map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntryCard;