import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-calm p-4">
      <Card className="bg-gradient-card shadow-glow border-0 text-center p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-primary rounded-full">
            <Brain className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-card-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-card-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/dashboard">
          <Button className="bg-gradient-primary hover:shadow-glow transition-bounce">
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
