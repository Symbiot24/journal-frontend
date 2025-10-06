import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import "../font.css";
import { 
  Heart, 
  BookOpen, 
  TrendingUp, 
  MessageCircle, 
  LogOut,
  Brain,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Heart },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/insights', label: 'Insights', icon: TrendingUp },
    { path: '/chat', label: 'Community', icon: MessageCircle },
  ];

  return (
    <Card className="bg-gradient-primary shadow-glow border-0 relative">
      <nav className="flex items-center justify-between p-4">
        <Link to="/dashboard" className="flex items-center space-x-2 text-primary-foreground">
          <img className='h-10 w-10' src="mindecho.png" alt="" />
          <div>
          <span style={{color : "#000000", fontFamily : "MyFontBold"}} className="text-xl font-bold">mind</span>
          <span style={{color : "#000000", fontFamily : "MyFontLight"}} className="text-xl">echo</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`text-primary-foreground hover:bg-primary-light/20 transition-smooth ${
                    isActive(item.path) ? 'bg-primary-foreground text-primary shadow-card' : ''
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-primary-foreground text-sm hidden md:block">
            Welcome, {user?.username}
          </span>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-light/20 transition-smooth hidden md:flex"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Logout</span>
          </Button>

          {/* Mobile menu toggle */}
          <Button 
            variant="ghost" 
            className="md:hidden text-primary-foreground hover:bg-primary-light/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-primary shadow-glow z-50 border-t border-primary-light/20 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-4 space-y-3">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={`w-full justify-start text-primary-foreground hover:bg-primary-light/20 transition-smooth ${
                      isActive(item.path) ? 'bg-primary-foreground text-primary shadow-card' : ''
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-primary-foreground hover:bg-primary-light/20 transition-smooth"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
            <div className="text-primary-foreground text-sm pt-2 border-t border-primary-light/20">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Navbar;