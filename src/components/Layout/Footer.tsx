import { Instagram, Facebook, MessageSquare, Linkedin } from 'lucide-react';
import content from '@/data/content.json';

const Footer = () => {
  return (
    <footer className="bg-luxury-charcoal text-luxury-cream">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-serif font-medium text-luxury-gold">
              {content.site.title}
            </h3>
            <p className="text-sm sm:text-base text-luxury-cream/80 leading-relaxed">
              {content.footer.tagline}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-medium text-luxury-gold">
              {content.footer.contactTitle}
            </h4>
            <div className="space-y-2 text-sm">
              <p className="break-words">{content.contact.info.email}</p>
              <p>{content.contact.info.phone}</p>
              <p>{content.contact.info.address}</p>
              <p className="italic">{content.contact.info.hours}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4 text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-medium text-luxury-gold">
              {content.footer.socialTitle}
            </h4>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:flex-col sm:gap-3">
              {content.contact.social.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-luxury-cream/80 hover:text-luxury-gold transition-colors duration-300 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                  aria-label={`Follow us on ${social.platform}`}
                >
                  {social.platform === 'Instagram' && <Instagram size={20} />}
                  {social.platform === 'Facebook' && <Facebook size={20} />}
                  {social.platform === 'LinkedIn' && <Linkedin size={20} />}
                  {social.platform === 'WhatsApp' && <MessageSquare size={20} />}
                  <span className="text-sm hidden sm:inline">{social.username}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-luxury-gold/20 mt-8 pt-8">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <p className="text-xs sm:text-sm text-luxury-cream/60 text-center">
              {content.footer.copyright}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {content.footer.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  className="text-xs sm:text-sm text-luxury-cream/60 hover:text-luxury-gold transition-colors duration-300 min-h-[44px] flex items-center sm:min-h-0"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;