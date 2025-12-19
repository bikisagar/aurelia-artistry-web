import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import content from '@/data/content.json';
import logo from '@/assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-luxury-charcoal/80 backdrop-blur-sm'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 sm:space-x-3 group"
            aria-label="Aurelia Tradisia Home"
          >
            <img
              src={logo}
              alt="Aurelia Tradisia Logo"
              className="h-10 sm:h-12 w-auto transform group-hover:scale-105 transition-transform duration-300"
            />
            <span className={`text-lg sm:text-xl md:text-2xl font-serif font-medium transition-colors ${
              isScrolled ? 'text-luxury-charcoal' : 'text-luxury-cream'
            }`}>
              {content.site.title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {content.navigation.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-2 px-3 lg:px-4 font-medium tracking-wide uppercase text-xs lg:text-sm transition-colors duration-300 ${
                    isActive
                      ? 'text-luxury-gold'
                      : isScrolled
                        ? 'text-luxury-charcoal hover:text-luxury-gold'
                        : 'text-luxury-cream hover:text-luxury-gold'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-luxury-gold"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-md transition-colors duration-300 ${
              isScrolled 
                ? 'text-luxury-charcoal hover:text-luxury-gold hover:bg-luxury-cream' 
                : 'text-luxury-cream hover:text-luxury-gold hover:bg-white/10'
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`py-4 space-y-1 border-t mt-3 ${
            isScrolled ? 'border-luxury-charcoal/10' : 'border-luxury-cream/20'
          }`}>
            {content.navigation.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-3 px-4 font-medium tracking-wide uppercase text-sm rounded-sm transition-colors duration-300 ${
                    isActive
                      ? isScrolled 
                        ? 'text-luxury-gold bg-luxury-cream'
                        : 'text-luxury-gold bg-white/10'
                      : isScrolled
                        ? 'text-luxury-charcoal hover:text-luxury-gold hover:bg-luxury-cream/50'
                        : 'text-luxury-cream hover:text-luxury-gold hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;