import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import GalleryItem from '@/components/Gallery/GalleryItem';
import FilterPanel, { FilterState } from '@/components/Gallery/FilterPanel';
import SearchBar from '@/components/Gallery/SearchBar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import galleryData from '@/data/interior_design_gallery.json';
import Fuse from 'fuse.js';

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

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Reset page when filters/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    // Filter and Search Logic
    const filteredItems = useMemo(() => {
        let result = galleryData.items;

        // 1. Search (Fuse.js)
        if (searchQuery) {
            const fuse = new Fuse(result, {
                keys: ['title', 'tags', 'sculptureType', 'style', 'roomType'],
                threshold: 0.4,
                useExtendedSearch: true
            });
            result = fuse.search(searchQuery).map(r => r.item);
        }

        // 2. Filters
        if (filters.sculptureType.length > 0) {
            result = result.filter(item => filters.sculptureType.includes(item.sculptureType));
        }
        if (filters.roomType.length > 0) {
            result = result.filter(item => item.roomType.some(r => filters.roomType.includes(r)));
        }
        if (filters.style.length > 0) {
            result = result.filter(item => item.style.some(s => filters.style.includes(s)));
        }

        return result;
    }, [searchQuery, filters]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const currentItems = filteredItems.slice(
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

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Header />

            <main className="container mx-auto px-6 pt-32 pb-16">
                {/* Page Header */}
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="heading-xl text-luxury-charcoal mb-4">The Collection</h1>
                    <p className="body-lg text-muted-foreground">
                        Explore our curated selection of museum-quality Indian sculptures,
                        each piece chosen for its artistic merit and spiritual resonance.
                    </p>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-20 z-30 bg-background/95 backdrop-blur py-4 border-b border-border/40">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Mobile Filter Trigger */}
                        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden gap-2">
                                    <Filter size={16} />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                                <div className="py-6">
                                    <h2 className="heading-md mb-6">Filters</h2>
                                    <FilterPanel
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                        onClearFilters={clearFilters}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="hidden lg:block text-sm text-muted-foreground">
                            Showing {filteredItems.length} results
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
                        />
                    </aside>

                    {/* Gallery Grid */}
                    <div className="flex-1 w-full">
                        {currentItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {currentItems.map(item => (
                                    <GalleryItem key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-luxury-cream/20 rounded-sm">
                                <h3 className="heading-md text-luxury-charcoal mb-2">No items found</h3>
                                <p className="text-muted-foreground mb-6">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear all filters
                                </Button>
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
