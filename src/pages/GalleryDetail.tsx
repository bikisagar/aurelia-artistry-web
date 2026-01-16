import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Mail, Loader2 } from 'lucide-react';
import GalleryItem from '@/components/Gallery/GalleryItem';
import { getSupabaseClient, DesignAsset, parseDesignAsset, DesignItem, parseArrayStringValues } from '@/lib/supabaseDesign';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
            <h1 className="heading-xl text-luxury-charcoal mb-4">Item Not Found</h1>
            <p className="text-muted-foreground mb-8">{error || 'The item you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/collection')} className="btn-primary">
              Return to Collection
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

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb / Back */}
          <div className="mb-10">
            <Link 
              to="/collection" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-luxury-gold transition-colors duration-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Collection
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
            {/* Left Column: Premium Image Display */}
            <div className="relative">
              <div className="sticky top-32">
                <div className="relative overflow-hidden bg-luxury-cream/30 shadow-[var(--shadow-luxury)]">
                  <img 
                    src={item.imageUrl} 
                    alt={item.imageAlt} 
                    className="w-full h-auto object-contain max-h-[75vh] transition-transform duration-700 hover:scale-[1.02]" 
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Unavailable';
                    }} 
                  />
                  
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col justify-start lg:pt-8">
              {/* Title */}
              <h1 className="heading-lg text-luxury-charcoal mb-8 fade-in">
                {item.title}
              </h1>

              {/* Description as Markdown */}
              {item.description && (
                <div className="prose prose-lg prose-stone max-w-none mb-10 text-muted-foreground leading-relaxed fade-in">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-luxury-charcoal">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                      h1: ({ children }) => <h2 className="heading-md text-luxury-charcoal mt-6 mb-3">{children}</h2>,
                      h2: ({ children }) => <h3 className="text-xl font-semibold text-luxury-charcoal mt-5 mb-2">{children}</h3>,
                      h3: ({ children }) => <h4 className="text-lg font-medium text-luxury-charcoal mt-4 mb-2">{children}</h4>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-luxury-gold/50 pl-4 italic text-muted-foreground my-4">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {item.description}
                  </ReactMarkdown>
                </div>
              )}

              {/* Metadata Grid */}
              {hasMetadata && (
                <div className="border-y border-luxury-gold/20 py-8 mb-10 fade-in">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {item.designContext && (
                      <div className="group">
                        <span className="block text-xs uppercase tracking-widest text-luxury-gold mb-2 font-medium">
                          Design Context
                        </span>
                        <span className="text-luxury-charcoal font-medium">
                          {item.designContext}
                        </span>
                      </div>
                    )}
                    {item.sculpturalForm && (
                      <div className="group">
                        <span className="block text-xs uppercase tracking-widest text-luxury-gold mb-2 font-medium">
                          Sculptural Form
                        </span>
                        <span className="text-luxury-charcoal font-medium">
                          {item.sculpturalForm}
                        </span>
                      </div>
                    )}
                    {item.interiorArea && (
                      <div className="group">
                        <span className="block text-xs uppercase tracking-widest text-luxury-gold mb-2 font-medium">
                          Interior Area
                        </span>
                        <span className="text-luxury-charcoal font-medium">
                          {item.interiorArea}
                        </span>
                      </div>
                    )}
                    {item.placementType && (
                      <div className="group">
                        <span className="block text-xs uppercase tracking-widest text-luxury-gold mb-2 font-medium">
                          Placement Type
                        </span>
                        <span className="text-luxury-charcoal font-medium">
                          {item.placementType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 fade-in">
                {item.isSculptureAvailable && (
                  <Button 
                    className="w-full h-14 text-sm uppercase tracking-widest font-medium bg-luxury-charcoal hover:bg-luxury-charcoal/90 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                    onClick={() => navigate('/contact')}
                  >
                    This Sculpture
                  </Button>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  {item.isSculptureAvailable ? (
                    <Button 
                      className="flex-1 h-14 text-sm uppercase tracking-widest font-medium bg-gradient-to-r from-luxury-gold to-luxury-bronze hover:from-luxury-gold-light hover:to-luxury-gold text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                      onClick={() => navigate('/contact')}
                    >
                      <Mail className="mr-3 h-4 w-4" />
                      Inquire About This Piece
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 h-14 text-sm uppercase tracking-widest font-medium border-2 border-luxury-gold text-luxury-gold bg-transparent hover:bg-luxury-gold hover:text-white transition-all duration-300"
                      variant="outline"
                      onClick={() => navigate('/contact')}
                    >
                      <Mail className="mr-3 h-4 w-4" />
                      Inquire About Similar Sculpture
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="h-14 px-6 border-luxury-charcoal/20 hover:border-luxury-gold hover:text-luxury-gold transition-all duration-300" 
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Designs Section - Carousel */}
        {similarItems.length > 0 && (
          <section className="mt-6 py-8 bg-gradient-to-b from-luxury-cream/30 to-transparent">
            <div className="container mx-auto px-6">
              <div className="text-center mb-14">
                <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium mb-3 block">
                  Curated Selection
                </span>
                <h2 className="heading-md text-luxury-charcoal">Similar Designs</h2>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop:false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {similarItems.map((related, index) => (
                    <CarouselItem 
                      key={related.id} 
                      className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
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
                    <CarouselPrevious className="hidden md:flex -left-4 bg-white/90 border-luxury-gold/30 hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-all duration-300" />
                    <CarouselNext className="hidden md:flex -right-4 bg-white/90 border-luxury-gold/30 hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-all duration-300" />
                  </>
                )}
              </Carousel>
            </div>
          </section>
        )}

        {/* Other Designs You May Like - Carousel */}
        {otherItems.length > 0 && (
          <section className="mt-6 py-8">
            <div className="container mx-auto px-6">
              <div className="text-center mb-14">
                <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium mb-3 block">
                  Explore More
                </span>
                <h2 className="heading-md text-luxury-charcoal">Other Designs You May Like</h2>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop:false ,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {otherItems.map((other, index) => (
                    <CarouselItem 
                      key={other.id} 
                      className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
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
                    <CarouselPrevious className="hidden md:flex -left-4 bg-white/90 border-luxury-gold/30 hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-all duration-300" />
                    <CarouselNext className="hidden md:flex -right-4 bg-white/90 border-luxury-gold/30 hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-all duration-300" />
                  </>
                )}
              </Carousel>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GalleryDetail;
