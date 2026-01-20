import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Award } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import DesignDiscoverySection from '@/components/Home/DesignDiscoverySection';
import content from '@/data/content.json';
import heroImage from '@/assets/hero-bg.jpg';
import galleryInterior from '@/assets/gallery-interior.jpg';

const Index = () => {
  useEffect(() => {
    // Add scroll animations
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center parallax-section"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url(${heroImage})`
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center text-white pt-16 sm:pt-0">
          <h1 className="heading-xl mb-6 sm:mb-8 fade-in text-white">
            {content.home.hero.title}
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-light mb-6 sm:mb-8 max-w-4xl mx-auto slide-up text-white/90 tracking-wide">
            {content.home.hero.subtitle}
          </p>
          <p className="body-lg mb-10 sm:mb-14 max-w-3xl mx-auto slide-up px-2 text-white/75">
            {content.home.hero.description}
          </p>
          <Link 
            to="/contact" 
            className="btn-primary inline-flex items-center space-x-3 slide-up text-xs sm:text-[11px]"
            style={{ animationDelay: '0.4s' }}
          >
            <span>{content.home.hero.cta}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Scroll Indicator - refined */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-5 h-9 border border-white/30 rounded-full flex justify-center">
            <div className="w-0.5 h-2.5 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 sm:py-28 lg:py-32 bg-[hsl(var(--luxury-cream))]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="animate-on-scroll order-2 lg:order-1">
                <h2 className="heading-lg text-luxury-charcoal mb-5 sm:mb-6 text-center lg:text-left">
                  {content.home.introduction.title}
                </h2>
                <p className="body-lg mb-8 sm:mb-10 text-center lg:text-left">
                  {content.home.introduction.content}
                </p>
                <div className="text-center lg:text-left">
                  <Link to="/about" className="btn-secondary inline-flex items-center space-x-3">
                    <span>Learn Our Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="animate-on-scroll order-1 lg:order-2">
                <div className="relative flex items-center justify-center bg-white luxury-card overflow-hidden">
                  <img 
                    src={galleryInterior} 
                    alt={content.home.introduction.alt}
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--luxury-charcoal)/0.1)] to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 sm:mb-20">
            <h2 className="heading-lg text-luxury-charcoal mb-4 sm:mb-5 animate-on-scroll">
              Excellence in Every Detail
            </h2>
            <div className="luxury-divider my-6"></div>
            <p className="body-lg max-w-3xl mx-auto animate-on-scroll px-2">
              Our commitment to authenticity, quality, and service sets us apart in the world of fine art curation.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 max-w-5xl mx-auto">
            <div className="text-center animate-on-scroll stagger-fade p-6">
              <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_hsl(var(--luxury-gold)/0.3)]">
                <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-4">
                Curated Excellence
              </h3>
              <p className="body-md">
                Each piece is carefully selected for its historical significance and artistic merit by our expert curators.
              </p>
            </div>

            <div className="text-center animate-on-scroll stagger-fade p-6">
              <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_hsl(var(--luxury-gold)/0.3)]">
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-4">
                Authenticated Provenance
              </h3>
              <p className="body-md">
                Every sculpture comes with complete documentation and certification of its authenticity and origin.
              </p>
            </div>

            <div className="text-center animate-on-scroll stagger-fade p-6 sm:col-span-2 md:col-span-1">
              <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_hsl(var(--luxury-gold)/0.3)]">
                <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-4">
                Exclusive Access
              </h3>
              <p className="body-md">
                Private viewings and personalized consultations ensure a bespoke experience for every collector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Design Discovery Section */}
      <DesignDiscoverySection />

      {/* Exclusivity Section */}
      <section className="py-20 sm:py-28 lg:py-32 bg-[hsl(var(--luxury-charcoal))] text-[hsl(var(--luxury-cream))]">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-lg text-luxury-gold mb-6 sm:mb-8 animate-on-scroll">
              {content.home.exclusivity.title}
            </h2>
            <p className="body-lg mb-6 sm:mb-8 animate-on-scroll text-[hsl(var(--luxury-cream)/0.8)]">
              {content.home.exclusivity.description}
            </p>
            <p className="text-base sm:text-lg italic mb-10 sm:mb-14 text-[hsl(var(--luxury-cream)/0.6)] animate-on-scroll px-2">
              {content.home.exclusivity.note}
            </p>
            <Link to="/contact" className="btn-primary animate-on-scroll">
              Schedule Private Viewing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
