import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    onSearch: (query: string) => void;
    className?: string;
    placeholder?: string;
}

const SearchBar = ({ onSearch, className, placeholder = "Search gallery..." }: SearchBarProps) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className={cn("relative w-full max-w-md", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-11 border-luxury-charcoal/20 focus-visible:ring-luxury-gold rounded-sm bg-white/80 backdrop-blur-sm"
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-luxury-charcoal transition-colors"
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
