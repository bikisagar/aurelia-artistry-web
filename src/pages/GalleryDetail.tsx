import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Mail } from 'lucide-react';
import { getImageUrl } from '@/lib/googleDrive';
import galleryData from '@/data/interior_design_gallery.json';
import GalleryItem from '@/components/Gallery/GalleryItem';

const GalleryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<typeof galleryData.items[0] | null>(null);
    const [relatedItems, setRelatedItems] = useState<typeof galleryData.items>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const foundItem = galleryData.items.find(i => i.id === id);

        if (foundItem) {
            setItem(foundItem);

            // Find related items (by type or style, excluding current)
            const related = galleryData.items
                .filter(i => i.id !== id && (
                    i.sculptureType === foundItem.sculptureType ||
                    i.style.some(s => foundItem.style.includes(s))
                ))
                .slice(0, 4);

            setRelatedItems(related);
        } else {
            // Redirect to 404 or collection if not found (simple redirect for now)
            navigate('/collection');
        }
    }, [id, navigate]);

    if (!item) return null;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        // Could add a toast notification here
        alert("Link copied to clipboard!");
    };

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
                                <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden shadow-lg">
                                    <img
                                        src={getImageUrl(item.googleDriveId, 1200)}
                                        alt={item.imageAlt}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="flex flex-col justify-center">
                            <div className="mb-2 text-luxury-gold font-medium uppercase tracking-wider text-sm">
                                {item.sculptureType} • {item.roomType[0]}
                            </div>

                            <h1 className="heading-xl text-4xl mb-4 text-luxury-charcoal">
                                {item.title}
                            </h1>

                            <div className="text-2xl font-serif text-luxury-charcoal/80 mb-8">
                                {item.price}
                            </div>

                            <div className="prose prose-lg text-muted-foreground mb-8 leading-relaxed">
                                <p>{item.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-10 text-sm border-y border-border py-8">
                                <div>
                                    <span className="block text-muted-foreground mb-1">Dimensions</span>
                                    <span className="font-medium text-luxury-charcoal">{item.dimensions}</span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground mb-1">Style</span>
                                    <span className="font-medium text-luxury-charcoal">{item.style.join(', ')}</span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground mb-1">Date Added</span>
                                    <span className="font-medium text-luxury-charcoal">{item.publishedDate}</span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground mb-1">ID</span>
                                    <span className="font-medium text-luxury-charcoal uppercase">{item.id.split('-').pop()}</span>
                                </div>
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
                                    <GalleryItem key={related.id} item={related} />
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
