import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getImageUrl } from '@/lib/googleDrive';
import { Eye } from 'lucide-react';
import content from '@/data/content.json';

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

const galleryCardContent = (content as any).galleryCard;

const GalleryItem = ({
  item,
  useSupabaseUrl = false
}: GalleryItemProps) => {
  // Use direct imageUrl if Supabase mode, otherwise use Google Drive
  const imageSrc = useSupabaseUrl && item.imageUrl ? item.imageUrl : getImageUrl(item.googleDriveId || '', 400);
  
  return (
    <Link to={`/collection/${item.id}`} className="block h-full group touch-manipulation">
      <Card className="h-[420px] sm:h-[460px] md:h-[480px] border-0 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out rounded-sm overflow-hidden bg-white flex flex-col">
        {/* Fixed-height image container - refined */}
        <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-[hsl(var(--luxury-cream))] to-white flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={item.imageAlt} 
            loading="lazy" 
            className="max-w-full max-h-full object-contain transition-all duration-700 ease-out group-hover:scale-[1.02]" 
            onError={e => {
              (e.target as HTMLImageElement).src = galleryCardContent?.imagePlaceholder || 'https://placehold.co/600x400?text=Image+Unavailable';
            }} 
          />

          {/* Elegant Overlay - refined gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--luxury-charcoal)/0.7)] via-[hsl(var(--luxury-charcoal)/0.15)] to-transparent opacity-0 group-hover:opacity-100 active:opacity-100 transition-all duration-500 ease-out flex items-end justify-center pb-8">
            <div className="bg-white/95 backdrop-blur-sm text-luxury-charcoal px-6 py-2.5 flex items-center gap-2.5 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out shadow-lg">
              <Eye size={14} className="text-luxury-gold" />
              <span className="font-medium text-[10px] uppercase tracking-[0.2em]">{galleryCardContent?.viewDetails || 'View Details'}</span>
            </div>
          </div>
        </div>

        {/* Text content - refined spacing */}
        <CardContent className="p-5 sm:p-6 flex-1 flex flex-col border-t border-[hsl(var(--luxury-charcoal)/0.04)] min-h-0">
          <h3 className="font-serif text-sm sm:text-[15px] font-semibold mb-2 line-clamp-2 text-luxury-charcoal group-hover:text-luxury-gold transition-colors duration-300 leading-snug">
            {item.title}
          </h3>
          
          {/* Metadata - refined typography */}
          <div className="flex-1 flex flex-col justify-start space-y-1.5 min-h-[64px]">
            <p className="text-[9px] sm:text-[10px] font-semibold text-luxury-gold uppercase tracking-[0.15em] line-clamp-1 h-3.5">
              {item.designContext || '\u00A0'}
            </p>
            <p className="text-[11px] sm:text-xs text-[hsl(var(--luxury-charcoal)/0.6)] line-clamp-1 font-light h-4">
              {item.sculpturalForm || '\u00A0'}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[hsl(var(--luxury-charcoal)/0.45)] line-clamp-1 h-3.5">
              {item.interiorArea || item.placementType || '\u00A0'}
            </p>
          </div>
        </CardContent>

        <CardFooter className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 flex-shrink-0">
          <span className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-luxury-gold group-hover:text-luxury-bronze transition-colors duration-300">
            <span className="w-4 h-px bg-luxury-gold/40 group-hover:w-6 transition-all duration-300"></span>
            {galleryCardContent?.inquire || 'Inquire'}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default GalleryItem;
