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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${heroImage})`
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center text-white pt-16 sm:pt-0">
          <h1 className="heading-xl mb-4 sm:mb-6 fade-in">
            {content.home.hero.title}
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-light mb-6 sm:mb-8 max-w-4xl mx-auto slide-up">
            {content.home.hero.subtitle}
          </p>
          <p className="body-lg mb-8 sm:mb-12 max-w-3xl mx-auto opacity-90 slide-up px-2">
            {content.home.hero.description}
          </p>
          <Link 
            to="/contact" 
            className="btn-primary inline-flex items-center space-x-2 slide-up text-sm sm:text-base"
            style={{ animationDelay: '0.4s' }}
          >
            <span>{content.home.hero.cta}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 sm:py-24 bg-luxury-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="animate-on-scroll order-2 lg:order-1">
                <h2 className="heading-lg text-luxury-charcoal mb-4 sm:mb-6 text-center lg:text-left">
                  {content.home.introduction.title}
                </h2>
                <p className="body-lg text-luxury-charcoal/80 leading-relaxed mb-6 sm:mb-8 text-center lg:text-left">
                  {content.home.introduction.content}
                </p>
                <div className="text-center lg:text-left">
                  <Link to="/about" className="btn-secondary inline-flex items-center space-x-2">
                    <span>Learn Our Story</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              </div>
              <div className="animate-on-scroll order-1 lg:order-2">
                <div className="relative flex items-center justify-center bg-luxury-cream/50 luxury-card overflow-hidden">
                  <img 
                    src={galleryInterior} 
                    alt={content.home.introduction.alt}
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="heading-lg text-luxury-charcoal mb-4 sm:mb-6 animate-on-scroll">
              Excellence in Every Detail
            </h2>
            <p className="body-lg text-luxury-charcoal/80 max-w-3xl mx-auto animate-on-scroll px-2">
              Our commitment to authenticity, quality, and service sets us apart in the world of fine art curation.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center animate-on-scroll stagger-fade p-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-3 sm:mb-4">
                Curated Excellence
              </h3>
              <p className="body-md text-luxury-charcoal/80">
                Each piece is carefully selected for its historical significance and artistic merit by our expert curators.
              </p>
            </div>

            <div className="text-center animate-on-scroll stagger-fade p-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-3 sm:mb-4">
                Authenticated Provenance
              </h3>
              <p className="body-md text-luxury-charcoal/80">
                Every sculpture comes with complete documentation and certification of its authenticity and origin.
              </p>
            </div>

            <div className="text-center animate-on-scroll stagger-fade p-4 sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-3 sm:mb-4">
                Exclusive Access
              </h3>
              <p className="body-md text-luxury-charcoal/80">
                Private viewings and personalized consultations ensure a bespoke experience for every collector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Design Discovery Section */}
      <DesignDiscoverySection />

      {/* Exclusivity Section */}
      <section className="py-16 sm:py-24 bg-luxury-charcoal text-luxury-cream">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-lg text-luxury-gold mb-6 sm:mb-8 animate-on-scroll">
              {content.home.exclusivity.title}
            </h2>
            <p className="body-lg mb-6 sm:mb-8 animate-on-scroll">
              {content.home.exclusivity.description}
            </p>
            <p className="text-base sm:text-lg italic mb-8 sm:mb-12 text-luxury-cream/80 animate-on-scroll px-2">
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
