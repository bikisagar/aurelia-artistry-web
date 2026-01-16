import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getImageUrl } from '@/lib/googleDrive';
import { Eye } from 'lucide-react';

export interface GalleryItemProps {
  item: {
    id: string;
    title: string;
    designContext?: string;
    sculpturalForm?: string;
    interiorArea?: string;
    placementType?: string;
    googleDriveId?: string;
    imageUrl?: string;
    imageAlt: string;
    price?: string;
  };
  useSupabaseUrl?: boolean;
}

const GalleryItem = ({
  item,
  useSupabaseUrl = false
}: GalleryItemProps) => {
  // Use direct imageUrl if Supabase mode, otherwise use Google Drive
  const imageSrc = useSupabaseUrl && item.imageUrl ? item.imageUrl : getImageUrl(item.googleDriveId || '', 400);
  
  return (
    <Link to={`/collection/${item.id}`} className="block h-full group">
      <Card className="h-full border border-luxury-charcoal/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.12),0_10px_10px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-none overflow-hidden bg-white flex flex-col">
        {/* Fixed-height image container for uniform grid */}
        <div className="relative w-full h-[280px] sm:h-[320px] overflow-hidden bg-gradient-to-br from-luxury-cream to-white flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={item.imageAlt} 
            loading="lazy" 
            className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-[1.03]" 
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Unavailable';
            }} 
          />

          {/* Elegant Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/60 via-luxury-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
            <div className="bg-white text-luxury-charcoal px-8 py-3 flex items-center gap-3 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
              <Eye size={16} className="text-luxury-gold" />
              <span className="font-medium text-sm uppercase tracking-wider">View Details</span>
            </div>
          </div>
        </div>

        {/* Text content */}
        <CardContent className="p-6 flex-1 flex flex-col border-t border-luxury-charcoal/5">
          <h3 className="font-serif text-lg font-semibold mb-3 line-clamp-1 text-luxury-charcoal group-hover:text-luxury-gold transition-colors duration-300">
            {item.title}
          </h3>
          <div className="mt-auto space-y-2">
            {item.designContext && (
              <p className="text-[11px] font-semibold text-luxury-gold uppercase tracking-[0.15em]">
                {item.designContext}
              </p>
            )}
            {item.sculpturalForm && (
              <p className="text-sm text-luxury-charcoal/70 line-clamp-1 font-light">
                {item.sculpturalForm}
              </p>
            )}
            {item.interiorArea && (
              <p className="text-sm text-luxury-charcoal/60 line-clamp-1 font-light">
                {item.interiorArea}
              </p>
            )}
            {item.placementType && (
              <p className="text-xs text-luxury-charcoal/50 line-clamp-1">
                {item.placementType}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-luxury-gold group-hover:text-luxury-bronze transition-colors duration-300">
            <span className="w-6 h-px bg-luxury-gold/50 group-hover:w-8 transition-all duration-300"></span>
            Inquire
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default GalleryItem;
