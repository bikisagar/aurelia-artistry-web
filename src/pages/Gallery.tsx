import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import content from '@/data/content.json';
import bronzePlaceholder from '@/assets/bronze-placeholder.jpg';
import templePlaceholder from '@/assets/wooden-sculpture.jpg';
import marblePlaceholder from '@/assets/marble-placeholder.jpg';
import contemporaryPlaceholder from '@/assets/abstract-sculpture.jpg';
const Gallery = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-luxury-charcoal text-luxury-cream">
        <div className="container mx-auto px-6 text-center">
          <h1 className="heading-xl text-luxury-gold mb-6 fade-in">
            {content.gallery.title}
          </h1>
          <p className="body-lg text-luxury-cream/80 max-w-3xl mx-auto slide-up">
            {content.gallery.subtitle}
          </p>
        </div>
      </section>

      {/* Exclusive Notice */}
      <section className="btn-primary whitespace-nowrap w-full max-w-xs mx-auto md:w-auto md:max-w-none md:mx-0\n">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white luxury-card p-12">
              <Lock className="w-16 h-16 text-luxury-gold mx-auto mb-6" />
              <h2 className="heading-md text-luxury-charcoal mb-6">
                {content.gallery.notice.title}
              </h2>
              <p className="body-lg text-luxury-charcoal/80 mb-8 leading-relaxed">
                {content.gallery.notice.description}
              </p>
              <Link to="/contact" className="btn-primary block whitespace-nowrap w-full max-w-xs mx-auto md:inline-flex md:w-auto md:max-w-none md:mx-0\n">
                {content.gallery.notice.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {content.gallery.categories.map((category, index) => {
            const imageMap = [bronzePlaceholder, templePlaceholder, marblePlaceholder, contemporaryPlaceholder];
            return <div key={category.name} className={`luxury-card group cursor-pointer stagger-fade`} style={{
              animationDelay: `${index * 0.1}s`
            }}>
                {/* Fixed-height container for uniform grid */}
                <div className="relative h-[280px] sm:h-[320px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-luxury-charcoal/10 to-luxury-gold/20">
                  {/* Placeholder Image */}
                  <img src={imageMap[index]} alt={category.alt} className="max-w-full max-h-full object-contain opacity-30" />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/90 via-luxury-charcoal/50 to-transparent flex items-end">
                    <div className="p-6 text-white w-full">
                      <h3 className="heading-md mb-2">
                        {category.name}
                      </h3>
                      <p className="body-md mb-4 opacity-90">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Exclusive Access Badge */}
                  <div className="absolute top-4 right-4 bg-luxury-gold text-white px-4 py-2 rounded-sm flex items-center space-x-2">
                    <Eye size={16} />
                    <span className="text-sm font-medium">Private Access</span>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-luxury-gold/0 group-hover:bg-luxury-gold/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-center text-white">
                      <Lock className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Contact for Access</p>
                    </div>
                  </div>
                </div>
                </div>;
          })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-luxury-charcoal text-luxury-cream">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-lg text-luxury-gold mb-6">
            Ready to Explore Our Collection?
          </h2>
          <p className="body-lg mb-8 max-w-2xl mx-auto">
            Each piece in our collection tells a story of India's rich artistic heritage. 
            Contact us to begin your journey into exceptional art.
          </p>
          <Link to="/contact" className="btn-primary">
            Schedule Private Viewing
          </Link>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Gallery;