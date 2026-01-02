import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useDesignAssets } from '@/hooks/useDesignAssets';
import content from '@/data/content.json';

const DesignDiscoverySection = () => {
  const { items, isLoading } = useDesignAssets();
  const designDiscoveryContent = (content as any).home?.designDiscovery;

  // Take first 8 items for the carousel
  const carouselItems = items.slice(0, 8);

  if (!designDiscoveryContent) return null;

  return (
    <section className="py-16 sm:py-24 bg-luxury-cream">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="heading-lg text-luxury-charcoal mb-4 sm:mb-6 animate-on-scroll">
            {designDiscoveryContent.title}
          </h2>
          <p className="text-lg sm:text-xl text-luxury-gold font-serif mb-4 animate-on-scroll">
            {designDiscoveryContent.subtitle}
          </p>
          <p className="body-lg text-luxury-charcoal/80 animate-on-scroll">
            {designDiscoveryContent.description}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto animate-on-scroll">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
            </div>
          ) : carouselItems.length > 0 ? (
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {carouselItems.map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <Link
                      to={`/collection/${item.id}`}
                      className="block group relative overflow-hidden rounded-sm"
                    >
                                      <div className="w-full overflow-hidden bg-luxury-charcoal/10 flex items-center justify-center min-h-[200px]">
                                        <img
                                          src={item.imageUrl}
                                          alt={item.imageAlt || item.title}
                                          loading="lazy"
                                          className="w-full h-auto max-h-[300px] object-contain transition-transform duration-700 group-hover:scale-105"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              'https://placehold.co/600x400?text=Design+Preview';
                                          }}
                                        />
                                      </div>

                      {/* Overlay with title */}
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/80 via-transparent to-transparent flex items-end p-6">
                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-serif text-lg sm:text-xl line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-white/70 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            View Design
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-12 bg-white/90 hover:bg-white border-luxury-charcoal/20 text-luxury-charcoal" />
              <CarouselNext className="hidden sm:flex -right-4 lg:-right-12 bg-white/90 hover:bg-white border-luxury-charcoal/20 text-luxury-charcoal" />
            </Carousel>
          ) : (
            <div className="text-center py-12 text-luxury-charcoal/60">
              <p>Design inspirations coming soon.</p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12 animate-on-scroll">
          <Link
            to="/collection"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>{designDiscoveryContent.cta}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DesignDiscoverySection;
