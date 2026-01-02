import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import content from '@/data/content.json';
import founderPhoto from '@/assets/founder-photo.jpg';
import workshopPhoto from '@/assets/workshop-photo.jpg';
import curatedCollection from '@/assets/curated-collection.jpg';
import authenticationProcess from '@/assets/authentication-process.jpg';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-luxury-cream">
        <div className="container mx-auto px-6 text-center">
          <h1 className="heading-xl text-luxury-charcoal mb-6 fade-in">
            {content.about.title}
          </h1>
          <p className="body-lg text-luxury-charcoal/80 max-w-4xl mx-auto slide-up leading-relaxed">
            {content.about.hero.description}
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Founder Image */}
              <div className="w-full max-w-sm lg:w-2/5 fade-in">
                <div className="overflow-hidden rounded-none shadow-[var(--shadow-luxury)] flex items-center justify-center bg-luxury-cream">
                  <img 
                    src={founderPhoto}
                    alt={content.about.founder.alt}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Founder Content */}
              <div className="flex-1 lg:w-3/5 slide-up text-center lg:text-left">
                <h2 className="heading-lg text-luxury-charcoal mb-4">
                  Meet Our Founder
                </h2>
                <h3 className="heading-md text-luxury-gold mb-3">
                  {content.about.founder.name}
                </h3>
                <p className="text-luxury-charcoal/80 mb-4 uppercase tracking-wide text-sm">
                  {content.about.founder.title}
                </p>
                <p className="body-md text-luxury-charcoal/90 leading-relaxed">
                  {content.about.founder.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Journey Section */}
      <section className="py-16 bg-luxury-cream">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-lg text-luxury-charcoal mb-4 fade-in">
                Our Mission & Journey
              </h2>
            </div>

            <div className="space-y-12">
              {content.about.mission.map((item, index) => (
                <div 
                  key={item.title}
                  className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  } stagger-fade`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Content */}
                  <div className="flex-1 lg:w-3/5">
                    <div className="text-center lg:text-left">
                      <h3 className="heading-md text-luxury-charcoal mb-4">
                        {item.title}
                      </h3>
                      <p className="body-md text-luxury-charcoal/80 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="w-full max-w-md lg:w-2/5">
                    <div className="overflow-hidden rounded-none shadow-[var(--shadow-luxury)] flex items-center justify-center bg-luxury-cream">
                      <img 
                        src={index === 0 ? workshopPhoto : 
                             index === 1 ? curatedCollection :
                             index === 2 ? authenticationProcess : 
                             workshopPhoto}
                        alt={item.alt}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-luxury-charcoal text-luxury-cream">
        <div className="container mx-auto px-6 text-center">
          <h2 className="heading-lg text-luxury-gold mb-4">
            Experience Our Legacy
          </h2>
          <p className="body-lg mb-6 max-w-2xl mx-auto">
            Discover how our passion for Indian sculptural art can enhance your collection.
          </p>
          <Link to="/contact" className="btn-primary inline-block">
            Contact Our Curators
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;