import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Mail, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      console.log('Backend response:', data);

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      // Prefer token from headers; common header names are 'authorization' or 'x-auth-token'
      const headerAuth = response.headers.get('authorization') || response.headers.get('Authorization');
      const bearerToken = headerAuth?.startsWith('Bearer ')
        ? headerAuth.substring('Bearer '.length)
        : headerAuth || response.headers.get('x-auth-token') || response.headers.get('X-Auth-Token');

      const token = bearerToken || data.token;

      if (!token) {
        setError('Login succeeded but token was not provided.');
        return;
      }

      // Use user object from response if provided, else derive minimal user from form
      const userFromResponse = data.user || { id: data.id || 'unknown', email: user.email, username: (user.email || '').split('@')[0] };

      setAuth({ user: userFromResponse, token });
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in to MindEcho.",
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
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
              Welcome to MindEcho
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your personal mental health companion
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
                    placeholder="Enter your password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    className="pl-10 bg-background border-border focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-bounce"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary-glow transition-smooth font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-accent/20 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Demo: Use any email and password to log in
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;