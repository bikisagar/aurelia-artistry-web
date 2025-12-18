import { Instagram, Facebook, MessageSquare, Linkedin } from 'lucide-react';
import content from '@/data/content.json';

const Footer = () => {
  return (
    <footer className="bg-luxury-charcoal text-luxury-cream">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="heading-md text-luxury-gold">
              {content.site.title}
            </h3>
            <p className="body-md text-luxury-cream/80">
              {content.footer.tagline}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-luxury-gold">
              Contact Information
            </h4>
            <div className="space-y-2 text-sm">
              <p>{content.contact.info.email}</p>
              <p>{content.contact.info.phone}</p>
              <p>{content.contact.info.address}</p>
              <p className="italic">{content.contact.info.hours}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-luxury-gold">
              Follow Us
            </h4>
            <div className="flex flex-col space-y-3">
              {content.contact.social.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-luxury-cream/80 hover:text-luxury-gold transition-colors duration-300"
                  aria-label={`Follow us on ${social.platform}`}
                >
                  {social.platform === 'Instagram' && <Instagram size={20} />}
                  {social.platform === 'Facebook' && <Facebook size={20} />}
                  {social.platform === 'LinkedIn' && <Linkedin size={20} />}
                  {social.platform === 'WhatsApp' && <MessageSquare size={20} />}
                  <span className="text-sm">{social.username}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-luxury-gold/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-luxury-cream/60">
              {content.footer.copyright}
            </p>
            <div className="flex space-x-6">
              {content.footer.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  className="text-sm text-luxury-cream/60 hover:text-luxury-gold transition-colors duration-300"
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