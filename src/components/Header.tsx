import { Search, Menu, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/aiinasia-logo.png";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-24 items-center justify-between">
          <div className="flex items-end gap-8">
            <a href="/" className="flex flex-col items-start -ml-8">
              <img src={logo} alt="AI in Asia" className="h-32 md:h-24 w-auto" />
              <span className="text-xs md:text-sm text-muted-foreground font-medium leading-tight -mt-8" style={{ width: '180px', maxWidth: '180px' }}>
                AI news, insights and innovation
              </span>
            </a>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/category/features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="/category/news" className="text-sm font-medium hover:text-primary transition-colors">News</a>
              <a href="/category/tools" className="text-sm font-medium hover:text-primary transition-colors">Tools</a>
              <a href="/category/voices" className="text-sm font-medium hover:text-primary transition-colors">Voices</a>
              <a href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="w-64 pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="default" className="hidden md:inline-flex" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <a href="/category/features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="/category/news" className="text-sm font-medium hover:text-primary transition-colors">News</a>
              <a href="/category/tools" className="text-sm font-medium hover:text-primary transition-colors">Tools</a>
              <a href="/category/voices" className="text-sm font-medium hover:text-primary transition-colors">Voices</a>
              <a href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
              <a href="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
              {!user && (
                <div className="pt-2">
                  <Button variant="default" className="w-full" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              )}
              {user && (
                <div className="pt-2">
                  <Button variant="default" className="w-full" asChild>
                    <Link to="/profile">Profile</Link>
                  </Button>
                </div>
              )}
              <div className="pt-2">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full"
                />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
