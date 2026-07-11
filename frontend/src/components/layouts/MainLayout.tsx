import { Outlet, Link } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-primary/10 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  StudyAI
                </span>
              </Link>
            </div>

            {/* Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                Get Started
              </Link>
            </div>
            
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
