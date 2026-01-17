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
    <Link to={`/collection/${item.id}`} className="block h-full group touch-manipulation">
      <Card className="h-[420px] sm:h-[460px] md:h-[480px] border border-luxury-charcoal/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.12),0_10px_10px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-none overflow-hidden bg-white flex flex-col">
        {/* Fixed-height image container - responsive heights */}
        <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-luxury-cream to-white flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={item.imageAlt} 
            loading="lazy" 
            className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-[1.03]" 
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Unavailable';
            }} 
          />

          {/* Elegant Overlay - touch-friendly on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/60 via-luxury-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 active:opacity-100 transition-all duration-500 flex items-end justify-center pb-6 sm:pb-8">
            <div className="bg-white text-luxury-charcoal px-6 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
              <Eye size={14} className="text-luxury-gold sm:w-4 sm:h-4" />
              <span className="font-medium text-xs sm:text-sm uppercase tracking-wider">View Details</span>
            </div>
          </div>
        </div>

        {/* Text content - responsive padding and typography */}
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col border-t border-luxury-charcoal/5 min-h-0">
          <h3 className="font-serif text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 line-clamp-2 text-luxury-charcoal group-hover:text-luxury-gold transition-colors duration-300 leading-tight">
            {item.title}
          </h3>
          
          {/* Metadata - responsive spacing */}
          <div className="flex-1 flex flex-col justify-start space-y-1 sm:space-y-1.5 min-h-[60px] sm:min-h-[72px]">
            <p className="text-[9px] sm:text-[10px] font-semibold text-luxury-gold uppercase tracking-[0.12em] sm:tracking-[0.15em] line-clamp-1 h-3.5 sm:h-4">
              {item.designContext || '\u00A0'}
            </p>
            <p className="text-[11px] sm:text-xs text-luxury-charcoal/70 line-clamp-1 font-light h-3.5 sm:h-4">
              {item.sculpturalForm || '\u00A0'}
            </p>
            <p className="text-[11px] sm:text-xs text-luxury-charcoal/50 line-clamp-1 h-3.5 sm:h-4">
              {item.interiorArea || item.placementType || '\u00A0'}
            </p>
          </div>
        </CardContent>

        <CardFooter className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-luxury-gold group-hover:text-luxury-bronze transition-colors duration-300">
            <span className="w-4 sm:w-5 h-px bg-luxury-gold/50 group-hover:w-6 sm:group-hover:w-7 transition-all duration-300"></span>
            Inquire
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default GalleryItem;
