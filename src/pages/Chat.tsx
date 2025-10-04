import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Shield, Heart, MessageCircle, Sparkles, Loader2, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  isTyping?: boolean;
}

const Chat = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportCategories = [
    { 
      id: 'general', 
      name: 'General Support', 
      description: 'General mental health guidance and support',
      icon: '💬',
      prompt: 'You are a compassionate AI mental health support assistant. Provide empathetic, helpful guidance for general mental health concerns. Always encourage professional help when needed.'
    },
    { 
      id: 'anxiety', 
      name: 'Anxiety Support', 
      description: 'Specialized help for anxiety management',
      icon: '🌊',
      prompt: 'You are an AI specialized in anxiety support. Provide calming, practical techniques for managing anxiety, breathing exercises, and grounding methods. Be gentle and understanding.'
    },
    { 
      id: 'depression', 
      name: 'Depression Support', 
      description: 'Understanding and coping with depression',
      icon: '🌱',
      prompt: 'You are an AI focused on depression support. Offer hope, understanding, and practical strategies for managing depressive symptoms. Emphasize small steps and self-compassion.'
    },
    { 
      id: 'stress', 
      name: 'Stress Management', 
      description: 'Tools and techniques for stress relief',
      icon: '⚖️',
      prompt: 'You are an AI stress management specialist. Provide practical stress reduction techniques, time management tips, and healthy coping strategies. Focus on actionable advice.'
    },
    { 
      id: 'meditation', 
      name: 'Mindfulness & Meditation', 
      description: 'Guided mindfulness and meditation support',
      icon: '🧘',
      prompt: 'You are an AI mindfulness and meditation guide. Offer meditation techniques, mindfulness exercises, and guidance for developing a meditation practice. Be calm and centering.'
    },
  ];

  const getWelcomeMessage = (categoryId: string): Message => {
    const category = supportCategories.find(c => c.id === categoryId);
    const welcomeMessages = {
      general: "Hello! I'm your AI mental health support assistant. I'm here to listen and provide guidance. How are you feeling today?",
      anxiety: "Hi there! I specialize in anxiety support. I understand how overwhelming anxiety can feel, and I'm here to help you find calm. What's on your mind?",
      depression: "Hello, I'm here to support you with understanding and managing depression. Remember, you're not alone in this journey. How can I help you today?",
      stress: "Hi! I'm your stress management specialist. I can help you develop healthy coping strategies and find balance. What's causing you stress right now?",
      meditation: "Welcome to your mindfulness space. I'm here to guide you through meditation and mindfulness practices. Would you like to start with a breathing exercise or discuss meditation techniques?"
    };
    
    return {
      id: 'welcome',
      content: welcomeMessages[categoryId as keyof typeof welcomeMessages] || welcomeMessages.general,
      sender: 'ai',
      timestamp: new Date()
    };
  };

  useEffect(() => {
    // Load welcome message for the selected category
    setMessages([getWelcomeMessage(selectedCategory)]);
    scrollToBottom();
  }, [selectedCategory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: 'AI is typing...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const category = supportCategories.find(c => c.id === selectedCategory);
      const systemPrompt = category?.prompt || supportCategories[0].prompt;
      
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          category: selectedCategory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Handle different possible response formats
      const aiResponse = data.response || data.message || data.content || data.text || data.answer || JSON.stringify(data) || 'No response received';
      
      // Remove typing indicator and add AI response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }];
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove typing indicator and show error
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please reach out to a mental health professional or crisis hotline immediately.",
          sender: 'ai',
          timestamp: new Date()
        }];
      });
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI support. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarContent = (sender: string) => {
    switch (sender) {
      case 'user':
        return { content: 'You', className: 'bg-primary text-primary-foreground' };
      case 'ai':
        return { content: '🤖', className: 'bg-gradient-primary text-white' };
      case 'system':
        return { content: 'ℹ️', className: 'bg-accent text-accent-foreground' };
      default:
        return { content: 'U', className: 'bg-muted text-muted-foreground' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Support Category Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Support Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 text-left transition-smooth ${
                      selectedCategory === category.id 
                        ? 'bg-primary text-primary-foreground shadow-card' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs opacity-80 mt-1">{category.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-0 mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Status</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-card shadow-lg border-0 h-[700px] flex flex-col rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {supportCategories.find(c => c.id === selectedCategory)?.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Private & Secure</span>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-1">
                {messages.map((msg) => {
                  const avatarInfo = getAvatarContent(msg.sender);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-3 mb-4 ${
                        msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className={`${avatarInfo.className} text-sm font-medium shadow-md`}>
                          {avatarInfo.content}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 max-w-lg ${
                        msg.sender === 'user' ? 'text-right' : ''
                      }`}>
                        <div className={`flex items-center space-x-2 mb-2 ${
                          msg.sender === 'user' ? 'justify-end' : ''
                        }`}>
                          <span className="text-sm font-semibold text-foreground">
                            {msg.sender === 'user' ? 'You' : msg.sender === 'ai' ? 'AI Support' : 'System'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        
                        <div className={`p-4 rounded-2xl shadow-sm border ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground border-primary/20 ml-8'
                            : msg.sender === 'ai'
                            ? msg.isTyping 
                              ? 'bg-muted/80 text-muted-foreground italic border-muted/40 mr-8'
                              : 'bg-card text-card-foreground border-border mr-8'
                            : 'bg-accent/20 text-accent-foreground text-center border-accent/30'
                        }`}>
                          {msg.isTyping ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">{msg.content}</span>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-6 border-t border-border bg-card/50">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share what's on your mind..."
                    className="flex-1 bg-background border-2 border-border focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 rounded-xl px-4 py-3 text-sm"
                    maxLength={500}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
                    disabled={!message.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
                
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    {message.length}/500 characters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send
                  </p>
                </div>
              </div>
            </Card>

            {/* AI Support Information */}
            <Card className="bg-accent/10 border-accent/20 mt-4">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-accent-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium text-accent-foreground mb-2">AI Support Information</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• AI provides supportive guidance, not professional therapy</li>
                      <li>• Your conversations are private and secure</li>
                      <li>• If in crisis, contact emergency services immediately</li>
                      <li>• AI suggestions complement but don't replace professional care</li>
                      <li>• Switch categories anytime for specialized support</li>
                      <li>• Your conversations with AI assistant do not save. It will lose when you refresh or close the tab.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;