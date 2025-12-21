import { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import GalleryItem from '@/components/Gallery/GalleryItem';
import FilterPanel, { FilterState } from '@/components/Gallery/FilterPanel';
import SearchBar from '@/components/Gallery/SearchBar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import { useDesignAssets } from '@/hooks/useDesignAssets';
import content from '@/data/content.json';

const ITEMS_PER_PAGE = 12;

const InteriorGallery = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        sculptureType: [],
        roomType: [],
        style: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Get design page content from content.json
    const designContent = (content as any).design;

    // Use Supabase data hook - single source of truth
    const { items, filterOptions, isLoading, error, search } = useDesignAssets();

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Reset page when filters/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    // Trigger search when query or filters change
    useEffect(() => {
        search(searchQuery, filters);
    }, [searchQuery, filters, search]);

    // Pagination Logic
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const currentItems = items.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (category: keyof FilterState, value: string) => {
        setFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const clearFilters = () => {
        setFilters({ sculptureType: [], roomType: [], style: [] });
        setSearchQuery('');
    };

    // Check if any filters are active
    const hasActiveFilters = searchQuery || 
        filters.sculptureType.length > 0 || 
        filters.roomType.length > 0 || 
        filters.style.length > 0;

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Header />

            <main className="container mx-auto px-6 pt-32 pb-16">
                {/* Page Header */}
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="heading-xl text-luxury-charcoal mb-4">
                        {designContent?.title || 'The Collection'}
                    </h1>
                    <p className="body-lg text-muted-foreground">
                        {designContent?.subtitle || 'Explore our curated selection of museum-quality Indian sculptures.'}
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="text-center py-12 mb-8 bg-destructive/10 rounded-sm border border-destructive/20">
                        <p className="text-destructive">{error}</p>
                        <Button onClick={() => search('', { sculptureType: [], roomType: [], style: [] })} variant="outline" className="mt-4">
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-20 z-30 bg-background/95 backdrop-blur py-4 border-b border-border/40">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Mobile Filter Trigger */}
                        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden gap-2">
                                    <Filter size={16} />
                                    {designContent?.filters?.title || 'Filters'}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                                <div className="py-6">
                                    <h2 className="heading-md mb-6">{designContent?.filters?.title || 'Filters'}</h2>
                                    <FilterPanel
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                        onClearFilters={clearFilters}
                                        filterOptions={{
                                            sculptureType: filterOptions.sculptureTypes,
                                            roomType: filterOptions.roomTypes,
                                            style: filterOptions.styles
                                        }}
                                        labels={designContent?.filters?.categories}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="hidden lg:block text-sm text-muted-foreground">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                `Showing ${items.length} results`
                            )}
                        </div>
                    </div>

                    <SearchBar onSearch={setSearchQuery} />
                </div>

                <div className="flex gap-12 items-start">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 sticky top-40">
                        <FilterPanel
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={clearFilters}
                            filterOptions={{
                                sculptureType: filterOptions.sculptureTypes,
                                roomType: filterOptions.roomTypes,
                                style: filterOptions.styles
                            }}
                            labels={designContent?.filters?.categories}
                        />
                    </aside>

                    {/* Gallery Grid */}
                    <div className="flex-1 w-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
                            </div>
                        ) : currentItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {currentItems.map(item => (
                                    <GalleryItem 
                                        key={item.id} 
                                        item={{
                                            id: item.id,
                                            title: item.title,
                                            sculptureType: item.sculptureType,
                                            room: item.room,
                                            style: item.style,
                                            imageUrl: item.imageUrl,
                                            imageAlt: item.imageAlt,
                                            price: item.price
                                        }} 
                                        useSupabaseUrl={true} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-luxury-cream/20 rounded-sm">
                                <h3 className="heading-md text-luxury-charcoal mb-2">
                                    {designContent?.emptyState?.title || 'No designs found'}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {hasActiveFilters 
                                        ? (designContent?.emptyState?.description || 'Try adjusting your search or filters.')
                                        : 'No designs are currently available. Check back soon!'
                                    }
                                </p>
                                {hasActiveFilters && (
                                    <Button onClick={clearFilters} variant="outline">
                                        {designContent?.emptyState?.clearButton || 'Clear all filters'}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(p => p - 1); }}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === i + 1}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(p => p + 1); }}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default InteriorGallery;