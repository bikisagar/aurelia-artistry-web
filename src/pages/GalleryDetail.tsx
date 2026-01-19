import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Mail, Loader2, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import GalleryItem from '@/components/Gallery/GalleryItem';
import { getSupabaseClient, DesignAsset, parseDesignAsset, DesignItem, parseArrayStringValues } from '@/lib/supabaseDesign';
import content from '@/data/content.json';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

// Get gallery detail content from content.json
const galleryDetailContent = (content as any).galleryDetail;

// Weights for similarity scoring (higher = more important)
const SIMILARITY_WEIGHTS = {
  design_context: 3,    // Highest priority
  sculptural_form: 3,   // Highest priority
  interior_area: 2,     // Medium priority
  placement_type: 2,    // Medium priority
};

// Calculate similarity score between two raw design assets
const calculateSimilarityScore = (
  current: DesignAsset,
  candidate: DesignAsset
): number => {
  let score = 0;

  // Parse array values from raw database fields for each category
  const currentValues = {
    design_context: parseArrayStringValues(current.design_context),
    sculptural_form: parseArrayStringValues(current.sculptural_form),
    interior_area: parseArrayStringValues(current.interior_area),
    placement_type: parseArrayStringValues(current.placement_type),
  };

  const candidateValues = {
    design_context: parseArrayStringValues(candidate.design_context),
    sculptural_form: parseArrayStringValues(candidate.sculptural_form),
    interior_area: parseArrayStringValues(candidate.interior_area),
    placement_type: parseArrayStringValues(candidate.placement_type),
  };

  // Count overlapping values in each category and apply weights
  for (const category of Object.keys(SIMILARITY_WEIGHTS) as (keyof typeof SIMILARITY_WEIGHTS)[]) {
    const currentVals = currentValues[category];
    const candidateVals = candidateValues[category];
    
    // Count matching values (case-insensitive)
    const matches = currentVals.filter(cv => 
      candidateVals.some(candV => cv.toLowerCase() === candV.toLowerCase())
    ).length;
    
    // Apply weight to matches
    score += matches * SIMILARITY_WEIGHTS[category];
  }

  return score;
};

const GalleryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<DesignItem | null>(null);
  const [similarItems, setSimilarItems] = useState<DesignItem[]>([]);
  const [otherItems, setOtherItems] = useState<DesignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchItem = async () => {
      const client = getSupabaseClient();
      if (!client || !id) {
        setError('Unable to load item');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the specific item
        const { data, error: fetchError } = await client
          .from('design_assets')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching item:', fetchError);
          setError('Failed to load item');
          setIsLoading(false);
          return;
        }
        if (!data) {
          navigate('/collection');
          return;
        }
        
        const rawCurrentItem = data as DesignAsset;
        const parsedItem = parseDesignAsset(rawCurrentItem);
        setItem(parsedItem);

        // Fetch all active items for similarity matching
        const { data: allData } = await client
          .from('design_assets')
          .select('*')
          .eq('is_active', true)
          .neq('id', id)
          .order('created_at', { ascending: false });

        if (allData) {
          const allRaw = allData as DesignAsset[];
          
          // Calculate similarity scores using raw database values
          const scoredItems = allRaw.map(rawItem => ({
            rawItem,
            parsedItem: parseDesignAsset(rawItem),
            score: calculateSimilarityScore(rawCurrentItem, rawItem)
          }));
          
          // Filter items with score > 0 (at least one matching value) and sort by score
          const similar = scoredItems
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map(({ parsedItem }) => parsedItem);
          
          setSimilarItems(similar);
          
          // Other items: not in similar list, ordered by recency
          const similarIds = new Set(similar.map(s => s.id));
          const others = scoredItems
            .filter(({ parsedItem }) => !similarIds.has(parsedItem.id))
            .slice(0, 8)
            .map(({ parsedItem }) => parsedItem);
          
          setOtherItems(others);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load item');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  // Lightbox handlers
  const openLightbox = () => {
    setIsLightboxOpen(true);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }, [zoomLevel, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      // Limit panning based on zoom level
      const maxPan = (zoomLevel - 1) * 200;
      setPanPosition({
        x: Math.max(-maxPan, Math.min(maxPan, newX)),
        y: Math.max(-maxPan, Math.min(maxPan, newY))
      });
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - panPosition.x, 
        y: e.touches[0].clientY - panPosition.y 
      });
    }
  }, [zoomLevel, panPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      const maxPan = (zoomLevel - 1) * 200;
      setPanPosition({
        x: Math.max(-maxPan, Math.min(maxPan, newX)),
        y: Math.max(-maxPan, Math.min(maxPan, newY))
      });
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Header />
        <main className="pt-32 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-luxury-gold" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Header />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="heading-xl text-luxury-charcoal mb-4">{galleryDetailContent?.errorTitle || 'Item Not Found'}</h1>
            <p className="text-muted-foreground mb-8">{error || galleryDetailContent?.errorDescription || 'The item you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/collection')} className="btn-primary">
              {galleryDetailContent?.returnButton || 'Return to Collection'}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasMetadata = item.designContext || item.sculpturalForm || item.interiorArea || item.placementType;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Breadcrumb / Back - Mobile optimized */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <Link 
              to="/collection" 
              className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-luxury-gold active:text-luxury-gold transition-colors duration-300 touch-manipulation py-2"
            >
              <ArrowLeft size={14} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4" />
              {galleryDetailContent?.backToCollection || 'Back to Collection'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 xl:gap-20">
            {/* Left Column: Premium Image Display */}
            <div className="relative">
              <div className="lg:sticky lg:top-32">
                <div 
                  className="relative overflow-hidden bg-gradient-to-br from-luxury-cream/50 to-white border border-luxury-charcoal/5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.1)] sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] cursor-pointer group touch-manipulation"
                  onClick={openLightbox}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.imageAlt} 
                    className="w-full h-auto object-contain max-h-[50vh] sm:max-h-[60vh] md:max-h-[75vh] transition-transform duration-700 group-hover:scale-[1.02]" 
                    onError={e => {
                      (e.target as HTMLImageElement).src = galleryDetailContent?.imagePlaceholder || 'https://placehold.co/600x400?text=Image+Unavailable';
                    }} 
                  />
                  {/* Fullscreen hint overlay - always visible on mobile */}
                  <div className="absolute inset-0 bg-luxury-charcoal/0 group-hover:bg-luxury-charcoal/10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2.5 sm:p-3 shadow-lg">
                      <Maximize2 className="h-5 w-5 sm:h-6 sm:w-6 text-luxury-charcoal" />
                    </div>
                  </div>
                  {/* Mobile tap hint */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:hidden">
                    <span className="text-[10px] text-luxury-charcoal/60 bg-white/80 px-3 py-1 rounded-full">
                      {galleryDetailContent?.tapToEnlarge || 'Tap to enlarge'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fullscreen Lightbox - Mobile optimized */}
            <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
              <DialogContent className="max-w-[100vw] max-h-[100dvh] w-screen h-[100dvh] p-0 border-0 bg-luxury-charcoal/95 backdrop-blur-md rounded-none">
                {/* Close button - larger touch target on mobile */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full transition-all duration-300 group touch-manipulation"
                  aria-label="Close lightbox"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                </button>

                {/* Zoom controls - mobile positioned */}
                <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 active:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 touch-manipulation"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </button>
                  <span className="text-white text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 4}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 active:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 touch-manipulation"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </button>
                </div>

                {/* Pan hint - responsive */}
                {zoomLevel > 1 && (
                  <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 text-white/60 text-[10px] sm:text-xs font-medium bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                    {window.innerWidth < 640 ? (galleryDetailContent?.swipeToPan || 'Swipe to pan') : (galleryDetailContent?.dragToPan || 'Drag to pan')}
                  </div>
                )}

                {/* Zoomable image container - mobile touch optimized */}
                <div
                  ref={lightboxRef}
                  className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    className="max-w-[95vw] sm:max-w-[90vw] max-h-[80dvh] sm:max-h-[85vh] object-contain select-none transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                    }}
                    draggable={false}
                    onError={e => {
                      (e.target as HTMLImageElement).src = galleryDetailContent?.imagePlaceholder || 'https://placehold.co/600x400?text=Image+Unavailable';
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Right Column: Details */}
            <div className="flex flex-col justify-start lg:pt-8">
              {/* Title - responsive typography */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-serif font-bold text-luxury-charcoal mb-4 sm:mb-6 md:mb-8 fade-in leading-tight">
                {item.title}
              </h1>

              {/* Description as Markdown - responsive */}
              {item.description && (
                <div className="prose prose-sm sm:prose-base md:prose-lg prose-stone max-w-none mb-6 sm:mb-8 md:mb-10 text-muted-foreground leading-relaxed fade-in">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 sm:mb-4 last:mb-0 text-sm sm:text-base">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-luxury-charcoal">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc pl-4 sm:pl-5 mb-3 sm:mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 sm:pl-5 mb-3 sm:mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-muted-foreground text-sm sm:text-base">{children}</li>,
                      h1: ({ children }) => <h2 className="text-xl sm:text-2xl font-serif font-bold text-luxury-charcoal mt-4 sm:mt-6 mb-2 sm:mb-3">{children}</h2>,
                      h2: ({ children }) => <h3 className="text-lg sm:text-xl font-semibold text-luxury-charcoal mt-4 sm:mt-5 mb-2">{children}</h3>,
                      h3: ({ children }) => <h4 className="text-base sm:text-lg font-medium text-luxury-charcoal mt-3 sm:mt-4 mb-2">{children}</h4>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-3 sm:border-l-4 border-luxury-gold/50 pl-3 sm:pl-4 italic text-muted-foreground my-3 sm:my-4 text-sm sm:text-base">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {item.description}
                  </ReactMarkdown>
                </div>
              )}

              {/* Metadata Grid - responsive layout */}
              {hasMetadata && (
                <div className="border-t border-b border-luxury-charcoal/10 py-5 sm:py-6 md:py-8 mb-6 sm:mb-8 md:mb-10 fade-in bg-gradient-to-r from-luxury-cream/20 to-transparent -mx-1 sm:-mx-2 px-1 sm:px-2">
                  <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 md:gap-x-10 gap-y-4 sm:gap-y-5 md:gap-y-7">
                    {item.designContext && (
                      <div className="group">
                        <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-luxury-gold mb-1 sm:mb-2 font-semibold">
                          <span className="w-2 sm:w-3 h-px bg-luxury-gold"></span>
                          {galleryDetailContent?.metadata?.designContext || 'Design Context'}
                        </span>
                        <span className="text-luxury-charcoal font-medium text-[13px] sm:text-[14px] md:text-[15px] leading-snug block">
                          {item.designContext}
                        </span>
                      </div>
                    )}
                    {item.sculpturalForm && (
                      <div className="group">
                        <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-luxury-gold mb-1 sm:mb-2 font-semibold">
                          <span className="w-2 sm:w-3 h-px bg-luxury-gold"></span>
                          {galleryDetailContent?.metadata?.sculpturalForm || 'Sculptural Form'}
                        </span>
                        <span className="text-luxury-charcoal font-medium text-[13px] sm:text-[14px] md:text-[15px] leading-snug block">
                          {item.sculpturalForm}
                        </span>
                      </div>
                    )}
                    {item.interiorArea && (
                      <div className="group">
                        <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-luxury-gold mb-1 sm:mb-2 font-semibold">
                          <span className="w-2 sm:w-3 h-px bg-luxury-gold"></span>
                          {galleryDetailContent?.metadata?.interiorArea || 'Interior Area'}
                        </span>
                        <span className="text-luxury-charcoal font-medium text-[13px] sm:text-[14px] md:text-[15px] leading-snug block">
                          {item.interiorArea}
                        </span>
                      </div>
                    )}
                    {item.placementType && (
                      <div className="group">
                        <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-luxury-gold mb-1 sm:mb-2 font-semibold">
                          <span className="w-2 sm:w-3 h-px bg-luxury-gold"></span>
                          {galleryDetailContent?.metadata?.placementType || 'Placement Type'}
                        </span>
                        <span className="text-luxury-charcoal font-medium text-[13px] sm:text-[14px] md:text-[15px] leading-snug block">
                          {item.placementType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons - mobile optimized with larger touch targets */}
              <div className="flex flex-col gap-3 sm:gap-4 fade-in">
                {item.isSculptureAvailable && (
                  <Button 
                    className="w-full h-12 sm:h-14 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-semibold bg-luxury-charcoal hover:bg-luxury-charcoal/90 active:bg-luxury-charcoal/80 text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-300 touch-manipulation" 
                    onClick={() => navigate('/contact', { 
                      state: { 
                        reason: 'Order Sculpture',
                        messageType: 'orderSculpture',
                        itemTitle: item.title 
                      } 
                    })}
                  >
                    {galleryDetailContent?.buttons?.orderSculpture || 'Order This Sculpture'}
                  </Button>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {item.isSculptureAvailable ? (
                    <Button 
                      className="flex-1 h-12 sm:h-14 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-semibold bg-gradient-to-r from-luxury-gold to-luxury-bronze hover:from-luxury-gold-light hover:to-luxury-gold active:opacity-90 text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-300 touch-manipulation" 
                      onClick={() => navigate('/contact', { 
                        state: { 
                          reason: 'Inquiry About Specific Piece',
                          messageType: 'inquireAboutPiece',
                          itemTitle: item.title 
                        } 
                      })}
                    >
                      <Mail className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">{galleryDetailContent?.buttons?.inquireAboutPiece || 'Inquire About This Piece'}</span>
                      <span className="xs:hidden">{galleryDetailContent?.buttons?.inquireAboutPieceMobile || 'Inquire Now'}</span>
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 h-12 sm:h-14 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-semibold border-2 border-luxury-gold text-luxury-gold bg-transparent hover:bg-luxury-gold hover:text-white active:opacity-90 transition-all duration-300 touch-manipulation"
                      variant="outline"
                      onClick={() => navigate('/contact', { 
                        state: { 
                          reason: 'Inquiry About Similar Sculpture',
                          messageType: 'inquireAboutSimilar',
                          itemTitle: item.title 
                        } 
                      })}
                    >
                      <Mail className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">{galleryDetailContent?.buttons?.inquireAboutSimilar || 'Inquire About Similar Sculpture'}</span>
                      <span className="xs:hidden">{galleryDetailContent?.buttons?.inquireAboutSimilarMobile || 'Inquire Now'}</span>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="h-12 sm:h-14 w-full sm:w-auto sm:px-6 border-2 border-luxury-charcoal/10 hover:border-luxury-gold hover:text-luxury-gold active:opacity-90 transition-all duration-300 flex-shrink-0 touch-manipulation" 
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-0" />
                    <span className="sm:hidden text-[10px] uppercase tracking-[0.15em]">{galleryDetailContent?.buttons?.share || 'Share'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Designs Section - Carousel - Mobile optimized */}
        {similarItems.length > 0 && (
          <section className="mt-12 sm:mt-16 md:mt-20 py-10 sm:py-12 md:py-16 bg-gradient-to-b from-luxury-cream/40 via-luxury-cream/20 to-transparent">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <span className="w-8 sm:w-10 md:w-12 h-px bg-luxury-gold/40"></span>
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-luxury-gold font-semibold">
                    {galleryDetailContent?.similarDesigns?.badge || 'Curated Selection'}
                  </span>
                  <span className="w-8 sm:w-10 md:w-12 h-px bg-luxury-gold/40"></span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-luxury-charcoal">{galleryDetailContent?.similarDesigns?.title || 'Similar Designs'}</h2>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-6">
                  {similarItems.map((related, index) => (
                    <CarouselItem 
                      key={related.id} 
                      className="pl-3 sm:pl-4 md:pl-6 basis-[85%] xs:basis-[75%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <div className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <GalleryItem 
                          item={{
                            id: related.id,
                            title: related.title,
                            designContext: related.designContext,
                            sculpturalForm: related.sculpturalForm,
                            interiorArea: related.interiorArea,
                            placementType: related.placementType,
                            imageUrl: related.imageUrl,
                            imageAlt: related.imageAlt,
                            price: related.price
                          }} 
                          useSupabaseUrl={true} 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {similarItems.length > 3 && (
                  <>
                    <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 h-10 w-10 lg:h-12 lg:w-12 bg-white border-2 border-luxury-gold/20 text-luxury-charcoal hover:bg-luxury-gold hover:text-white hover:border-luxury-gold shadow-lg transition-all duration-300" />
                    <CarouselNext className="hidden md:flex -right-4 lg:-right-6 h-10 w-10 lg:h-12 lg:w-12 bg-white border-2 border-luxury-gold/20 text-luxury-charcoal hover:bg-luxury-gold hover:text-white hover:border-luxury-gold shadow-lg transition-all duration-300" />
                  </>
                )}
              </Carousel>
              {/* Mobile swipe hint */}
              <div className="flex justify-center mt-4 sm:hidden">
                <span className="text-[10px] text-luxury-charcoal/50">{galleryDetailContent?.similarDesigns?.swipeHint || 'Swipe to explore →'}</span>
              </div>
            </div>
          </section>
        )}

        {/* Other Designs You May Like - Carousel - Mobile optimized */}
        {otherItems.length > 0 && (
          <section className="mt-6 sm:mt-8 py-10 sm:py-12 md:py-16 border-t border-luxury-charcoal/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <span className="w-8 sm:w-10 md:w-12 h-px bg-luxury-charcoal/20"></span>
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-luxury-charcoal/60 font-semibold">
                    {galleryDetailContent?.otherDesigns?.badge || 'Explore More'}
                  </span>
                  <span className="w-8 sm:w-10 md:w-12 h-px bg-luxury-charcoal/20"></span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-luxury-charcoal">{galleryDetailContent?.otherDesigns?.title || 'Other Designs You May Like'}</h2>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-6">
                  {otherItems.map((other, index) => (
                    <CarouselItem 
                      key={other.id} 
                      className="pl-3 sm:pl-4 md:pl-6 basis-[85%] xs:basis-[75%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <div className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <GalleryItem 
                          item={{
                            id: other.id,
                            title: other.title,
                            designContext: other.designContext,
                            sculpturalForm: other.sculpturalForm,
                            interiorArea: other.interiorArea,
                            placementType: other.placementType,
                            imageUrl: other.imageUrl,
                            imageAlt: other.imageAlt,
                            price: other.price
                          }} 
                          useSupabaseUrl={true} 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {otherItems.length > 3 && (
                  <>
                    <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 h-10 w-10 lg:h-12 lg:w-12 bg-white border-2 border-luxury-charcoal/10 text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white hover:border-luxury-charcoal shadow-lg transition-all duration-300" />
                    <CarouselNext className="hidden md:flex -right-4 lg:-right-6 h-10 w-10 lg:h-12 lg:w-12 bg-white border-2 border-luxury-charcoal/10 text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white hover:border-luxury-charcoal shadow-lg transition-all duration-300" />
                  </>
                )}
              </Carousel>
              {/* Mobile swipe hint */}
              <div className="flex justify-center mt-4 sm:hidden">
                <span className="text-[10px] text-luxury-charcoal/50">{galleryDetailContent?.otherDesigns?.swipeHint || 'Swipe to explore →'}</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GalleryDetail;
