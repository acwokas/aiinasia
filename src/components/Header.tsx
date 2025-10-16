import { Search, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold">
                <span className="text-primary">AI</span>
                <span className="text-foreground">in</span>
                <span className="text-secondary">ASIA</span>
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

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button variant="default" className="hidden md:inline-flex" asChild>
              <a href="#newsletter">Subscribe</a>
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
