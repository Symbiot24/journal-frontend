import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type MoodType = 'happy' | 'neutral' | 'anxious' | 'sad' | 'angry';

interface MoodPickerProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
}

const MoodPicker: React.FC<MoodPickerProps> = ({ selectedMood, onMoodSelect }) => {
  const moods = [
    { value: 'happy' as MoodType, emoji: '😊', label: 'Happy', color: 'mood-happy' },
    { value: 'neutral' as MoodType, emoji: '😐', label: 'Neutral', color: 'mood-neutral' },
    { value: 'anxious' as MoodType, emoji: '😰', label: 'Anxious', color: 'mood-anxious' },
    { value: 'sad' as MoodType, emoji: '😢', label: 'Sad', color: 'mood-sad' },
    { value: 'angry' as MoodType, emoji: '😠', label: 'Angry', color: 'mood-angry' },
  ];


  return (
    <Card className="p-4 bg-gradient-card shadow-card">
      <h3 className="text-lg font-semibold mb-3 text-card-foreground">How are you feeling?</h3>
      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            variant={selectedMood === mood.value ? "default" : "outline"}
            className={`flex flex-col items-center p-3 h-auto transition-bounce hover:scale-105 ${
              selectedMood === mood.value 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : 'bg-card hover:bg-accent'
            }`}
            onClick={() => onMoodSelect(mood.value)}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default MoodPicker;