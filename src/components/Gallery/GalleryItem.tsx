import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getImageUrl } from '@/lib/googleDrive';
import { Eye } from 'lucide-react';

export interface GalleryItemProps {
    item: {
        id: string;
        title: string;
        sculptureType: string;
        room: string;
        style?: string;
        googleDriveId?: string;
        imageUrl?: string; // Direct URL from Supabase storage
        imageAlt: string;
        price?: string;
    };
    useSupabaseUrl?: boolean;
}

const GalleryItem = ({ item, useSupabaseUrl = false }: GalleryItemProps) => {
    // Use direct imageUrl if Supabase mode, otherwise use Google Drive
    const imageSrc = useSupabaseUrl && item.imageUrl 
        ? item.imageUrl 
        : getImageUrl(item.googleDriveId || '', 400);

    return (
        <Link to={`/collection/${item.id}`} className="block h-full group">
            <Card className="h-full border-none shadow-md hover:shadow-xl transition-shadow duration-300 rounded-none overflow-hidden bg-white">
                <div className="relative w-full overflow-hidden bg-gray-100 flex items-center justify-center min-h-[200px]">
                    <img
                        src={imageSrc}
                        alt={item.imageAlt}
                        loading="lazy"
                        className="w-full h-auto max-h-[400px] object-contain transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Unavailable';
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 text-luxury-charcoal px-6 py-2 rounded-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye size={16} />
                            <span className="font-medium text-sm">View Details</span>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6">
                    <h3 className="heading-md text-xl mb-2 line-clamp-1 group-hover:text-luxury-gold transition-colors">
                        {item.title}
                    </h3>
                    {item.sculptureType && (
                        <p className="text-xs font-medium text-luxury-gold uppercase tracking-wider mb-1">
                            {item.sculptureType}
                        </p>
                    )}
                    {item.room && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.room}
                        </p>
                    )}
                </CardContent>

                {item.price && (
                    <CardFooter className="px-6 pb-6 pt-0">
                        <p className="font-serif text-lg text-luxury-charcoal">{item.price}</p>
                    </CardFooter>
                )}
            </Card>
        </Link>
    );
};

export default GalleryItem;
