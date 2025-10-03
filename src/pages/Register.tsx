import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, User, Mail, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { log } from 'console';

const Register = () => {

  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    // Basic frontend validations
    if (user.password !== user.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    if (user.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Call backend directly
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      const data = await response.json();
      console.log('Backend response:', data);
  
      if (!response.ok) {
        // Show backend error message (like "User already exists")
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }
  
      // Prefer token from headers first, fall back to body
      const headerAuth = response.headers.get('authorization') || response.headers.get('Authorization');
      const bearerToken = headerAuth?.startsWith('Bearer ')
        ? headerAuth.substring('Bearer '.length)
        : headerAuth || response.headers.get('x-auth-token') || response.headers.get('X-Auth-Token');

      const token = bearerToken || data.token;

      if (!token) {
        setError('Registration succeeded but token was not provided.');
        return;
      }

      if (data?.user) {
        setAuth({ user: data.user, token });
      } else {
        // Minimal user fallback from form
        const fallbackUser = { id: data.id || 'unknown', email: user.email, username: user.username || (user.email || '').split('@')[0] };
        setAuth({ user: fallbackUser as any, token });
      }
      toast({
        title: "Welcome to MindEcho!",
        description: "Your account has been created successfully.",
      });
      navigate('/dashboard');

      
  
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-calm p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gradient-card shadow-glow border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-primary rounded-full">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Join MindEcho
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Start your mental wellness journey today
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="Name" className="text-card-foreground">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="pl-10 bg-background border-border focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-card-foreground">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    className="pl-10 bg-background border-border focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="pl-10 bg-background border-border focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    className="pl-10 bg-background border-border focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-card-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={user.confirmPassword}
                    onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                    className="pl-10 bg-background border-border focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-bounce"
                disabled={isLoading}
                onClick={() => console.log(user)}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-glow transition-smooth font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;