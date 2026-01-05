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
      <Card className="h-full border-none shadow-md hover:shadow-xl transition-shadow duration-300 rounded-none overflow-hidden bg-white flex flex-col">
        {/* Fixed-height image container for uniform grid */}
        <div className="relative w-full h-[280px] sm:h-[320px] overflow-hidden bg-gray-100 flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={item.imageAlt} 
            loading="lazy" 
            className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105" 
            onError={e => {
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

        {/* Text content */}
        <CardContent className="p-6 flex-1 flex flex-col">
          <h3 className="heading-md text-xl mb-2 line-clamp-1 group-hover:text-luxury-gold transition-colors">
            {item.title}
          </h3>
          <div className="mt-auto space-y-1">
            {item.designContext && (
              <p className="text-xs font-medium text-luxury-gold uppercase tracking-wider">
                {item.designContext}
              </p>
            )}
            {item.sculpturalForm && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {item.sculpturalForm}
              </p>
            )}
            {item.interiorArea && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {item.interiorArea}
              </p>
            )}
            {item.placementType && (
              <p className="text-xs text-muted-foreground/80 line-clamp-1">
                {item.placementType}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <span className="text-sm font-medium text-luxury-gold hover:text-luxury-charcoal transition-colors cursor-pointer">
            Inquire
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default GalleryItem;
