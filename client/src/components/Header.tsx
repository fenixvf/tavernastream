import { useState } from 'react';
import { Search, Menu, Heart, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useRoute } from 'wouter';
import logoIcon from '/icon-192.png';

interface HeaderProps {
  onSearch: (query: string) => void;
  onLogoClick: () => void;
  onMenuClick?: () => void;
  onBrowseClick?: () => void;
}

export function Header({ onSearch, onLogoClick, onMenuClick, onBrowseClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMyListPage] = useRoute('/minha-lista');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 transition-transform"
          data-testid="button-logo"
        >
          <img src={logoIcon} alt="Taverna Stream" className="w-8 h-8 object-contain" />
          <span className="text-xl md:text-2xl font-bold text-primary hidden sm:inline">
            Taverna Stream
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            href="/"
            className={`px-4 py-2 rounded-md font-medium transition-colors hover-elevate active-elevate-2 ${
              !isMyListPage ? 'text-foreground' : 'text-muted-foreground'
            }`} 
            data-testid="link-home"
          >
            Início
          </Link>
          {onBrowseClick && (
            <button
              onClick={onBrowseClick}
              className="px-4 py-2 rounded-md font-medium transition-colors hover-elevate active-elevate-2 flex items-center gap-2 text-muted-foreground"
              data-testid="button-browse"
            >
              <Compass className="w-4 h-4" />
              Navegar
            </button>
          )}
          <Link 
            href="/minha-lista"
            className={`px-4 py-2 rounded-md font-medium transition-colors hover-elevate active-elevate-2 flex items-center gap-2 ${
              isMyListPage ? 'text-foreground' : 'text-muted-foreground'
            }`} 
            data-testid="link-my-list"
          >
            <Heart className="w-4 h-4" />
            Minha Lista
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        {onMenuClick && (
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={onMenuClick}
            data-testid="button-mobile-menu"
          >
            <Menu className="w-6 h-6" />
          </Button>
        )}

        {/* Search Bar & Notifications */}
        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSearch}
            className={`flex items-center gap-2 transition-all ${
              isSearchExpanded ? 'flex-1 max-w-2xl' : 'w-auto'
            }`}
          >
            <div className="relative flex-1 max-w-md md:max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Buscar filmes, séries, animes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                className="pl-10 pr-4 bg-secondary/50 border-white/10 rounded-full focus:bg-secondary focus:border-primary/50 transition-colors"
                data-testid="input-search"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="rounded-full hidden md:flex"
              data-testid="button-search-submit"
            >
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
