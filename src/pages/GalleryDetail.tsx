import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Mail, Loader2 } from 'lucide-react';
import GalleryItem from '@/components/Gallery/GalleryItem';
import { getSupabaseClient, getStorageImageUrl, DesignAsset, parseDesignAsset, DesignItem } from '@/lib/supabaseDesign';

const GalleryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<DesignItem | null>(null);
    const [relatedItems, setRelatedItems] = useState<DesignItem[]>([]);
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

                const parsedItem = parseDesignAsset(data as DesignAsset);
                setItem(parsedItem);

                // Fetch related items by style or sculpture type
                const { data: relatedData } = await client
                    .from('design_assets')
                    .select('*')
                    .eq('is_active', true)
                    .neq('id', id)
                    .limit(4);

                if (relatedData) {
                    // Filter related items by matching style or sculpture type
                    const parsedRelated = (relatedData as DesignAsset[])
                        .map(parseDesignAsset)
                        .filter(r => 
                            r.sculptureType === parsedItem.sculptureType ||
                            r.style === parsedItem.style
                        )
                        .slice(0, 4);
                    
                    setRelatedItems(parsedRelated);
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
                <main className="pt-32 pb-16 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
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
                        <Button onClick={() => navigate('/collection')}>
                            Return to Collection
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />

            <main className="pt-32 pb-16">
                <div className="container mx-auto px-6">
                    {/* Breadcrumb / Back */}
                    <div className="mb-8">
                        <Link to="/collection" className="inline-flex items-center text-sm text-muted-foreground hover:text-luxury-gold transition-colors">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Collection
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
                        {/* Left Column: Image */}
                        <div className="relative">
                            <div className="sticky top-32">
                                <div className="w-full bg-gray-100 overflow-hidden shadow-lg flex items-center justify-center">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.imageAlt}
                                        className="w-full h-auto object-contain max-h-[70vh]"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Unavailable';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <h1 className="heading-xl text-4xl mb-4 text-luxury-charcoal">
                                {item.title}
                            </h1>

                            <div className="text-2xl font-serif text-luxury-charcoal/80 mb-8">
                                {item.price || 'Inquire'}
                            </div>

                            {item.description && (
                                <div className="prose prose-lg text-muted-foreground mb-8 leading-relaxed">
                                    <p>{item.description}</p>
                                </div>
                            )}

                            {/* Metadata section - only show fields with values */}
                            <div className="grid grid-cols-2 gap-6 mb-10 text-sm border-y border-border py-8">
                                {item.sculptureType && (
                                    <div>
                                        <span className="block text-muted-foreground mb-1">Sculpture Type</span>
                                        <span className="font-medium text-luxury-charcoal">{item.sculptureType}</span>
                                    </div>
                                )}
                                {item.room && (
                                    <div>
                                        <span className="block text-muted-foreground mb-1">Room</span>
                                        <span className="font-medium text-luxury-charcoal">{item.room}</span>
                                    </div>
                                )}
                                {item.style && (
                                    <div>
                                        <span className="block text-muted-foreground mb-1">Style</span>
                                        <span className="font-medium text-luxury-charcoal">{item.style}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="flex-1 h-12 text-base" onClick={() => navigate('/contact')}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Inquire About This Piece
                                </Button>
                                <Button variant="outline" className="h-12 px-6" onClick={handleShare}>
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {relatedItems.length > 0 && (
                    <section className="mt-32 bg-luxury-cream/20 py-20">
                        <div className="container mx-auto px-6">
                            <h2 className="heading-md text-3xl text-center mb-12">You May Also Like</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {relatedItems.map(related => (
                                    <GalleryItem 
                                        key={related.id} 
                                        item={{
                                            id: related.id,
                                            title: related.title,
                                            sculptureType: related.sculptureType,
                                            room: related.room,
                                            style: related.style,
                                            imageUrl: related.imageUrl,
                                            imageAlt: related.imageAlt,
                                            price: related.price
                                        }}
                                        useSupabaseUrl={true}
                                    />
                                ))}
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