import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Award } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
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
        <div className="container mx-auto px-6 text-center text-white">
          <h1 className="heading-xl mb-6 fade-in">
            {content.home.hero.title}
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-8 max-w-4xl mx-auto slide-up">
            {content.home.hero.subtitle}
          </p>
          <p className="body-lg mb-12 max-w-3xl mx-auto opacity-90 slide-up">
            {content.home.hero.description}
          </p>
          <Link 
            to="/contact" 
            className="btn-primary inline-flex items-center space-x-2 slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <span>{content.home.hero.cta}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-luxury-cream">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-on-scroll">
                <h2 className="heading-lg text-luxury-charcoal mb-6">
                  {content.home.introduction.title}
                </h2>
                <p className="body-lg text-luxury-charcoal/80 leading-relaxed mb-8">
                  {content.home.introduction.content}
                </p>
                <Link to="/about" className="btn-secondary inline-flex items-center space-x-2">
                  <span>Learn Our Story</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="animate-on-scroll">
                <div className="relative">
                  <img 
                    src={galleryInterior} 
                    alt={content.home.introduction.alt}
                    className="w-full h-96 object-cover luxury-card"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-luxury-charcoal mb-6 animate-on-scroll">
              Excellence in Every Detail
            </h2>
            <p className="body-lg text-luxury-charcoal/80 max-w-3xl mx-auto animate-on-scroll">
              Our commitment to authenticity, quality, and service sets us apart in the world of fine art curation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center animate-on-scroll stagger-fade">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-4">
                Curated Excellence
              </h3>
              <p className="body-md text-luxury-charcoal/80">
                Each piece is carefully selected for its historical significance and artistic merit by our expert curators.
              </p>
            </div>

            <div className="text-center animate-on-scroll stagger-fade">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-4">
                Authenticated Provenance
              </h3>
              <p className="body-md text-luxury-charcoal/80">
                Every sculpture comes with complete documentation and certification of its authenticity and origin.
              </p>
            </div>

            <div className="text-center animate-on-scroll stagger-fade">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-md text-luxury-charcoal mb-4">
                Exclusive Access
              </h3>
              <p className="body-md text-luxury-charcoal/80">
                Private viewings and personalized consultations ensure a bespoke experience for every collector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusivity Section */}
      <section className="py-24 bg-luxury-charcoal text-luxury-cream">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-lg text-luxury-gold mb-8 animate-on-scroll">
              {content.home.exclusivity.title}
            </h2>
            <p className="body-lg mb-8 animate-on-scroll">
              {content.home.exclusivity.description}
            </p>
            <p className="text-lg italic mb-12 text-luxury-cream/80 animate-on-scroll">
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
