import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useToast } from '@/hooks/use-toast';
import content from '@/data/content.json';
import { submitToGoogleForm } from '@/services/formService';
interface ContactLocationState {
  reason?: string;
  messageType?: 'orderSculpture' | 'inquireAboutPiece' | 'inquireAboutSimilar';
  itemTitle?: string;
}
const Contact = () => {
  const {
    toast
  } = useToast();
  const location = useLocation();
  const locationState = location.state as ContactLocationState | null;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    message: ''
  });
  useEffect(() => {
    window.scrollTo(0, 0);

    // Pre-fill form based on navigation state from GalleryDetail
    if (locationState) {
      const {
        reason,
        messageType,
        itemTitle
      } = locationState;
      let defaultMessage = '';
      if (messageType && itemTitle) {
        const defaultMessages = (content.contact.form as any).defaultMessages;
        if (defaultMessages && defaultMessages[messageType]) {
          defaultMessage = defaultMessages[messageType].replace('{{title}}', itemTitle);
        }
      }
      setFormData(prev => ({
        ...prev,
        reason: reason || '',
        message: defaultMessage
      }));
    }
  }, [locationState]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.reason || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    try {
      // Show loading state
      toast({
        title: "Sending...",
        description: "Please wait while we process your message."
      });
      await submitToGoogleForm(formData);

      // Show success message
      toast({
        title: "Success!",
        description: content.contact.form.success,
        variant: "success"
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        reason: '',
        message: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: content.contact.form.error,
        variant: "destructive"
      });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-luxury-cream">
        <div className="container mx-auto px-6 text-center">
          <h1 className="heading-xl text-luxury-charcoal mb-6 fade-in">
            {content.contact.title}
          </h1>
          <p className="body-lg text-luxury-charcoal/80 max-w-3xl mx-auto slide-up">
            {content.contact.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="body-lg text-luxury-charcoal/80 max-w-3xl mx-auto">
                {content.contact.description}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="luxury-card p-8">
                <h2 className="heading-md text-luxury-charcoal mb-8">
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-luxury-charcoal mb-2">
                      {content.contact.form.name} *
                    </label>
                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-luxury-charcoal/20 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 outline-none transition-all duration-300" />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-luxury-charcoal mb-2">
                      {content.contact.form.email} *
                    </label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-luxury-charcoal/20 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 outline-none transition-all duration-300" />
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-luxury-charcoal mb-2">
                      {content.contact.form.reason.label}
                    </label>
                    <select id="reason" name="reason" value={formData.reason} onChange={handleChange} className="w-full px-4 py-3 border border-luxury-charcoal/20 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 outline-none transition-all duration-300">
                      <option value="">Select a reason...</option>
                      {content.contact.form.reason.options.map(option => <option key={option} value={option}>
                          {option}
                        </option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-luxury-charcoal mb-2">
                      {content.contact.form.message} *
                    </label>
                    <textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleChange} className="w-full px-4 py-3 border border-luxury-charcoal/20 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 outline-none transition-all duration-300 resize-none"></textarea>
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    {content.contact.form.submit}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="luxury-card p-8">
                  <h2 className="heading-md text-luxury-charcoal mb-8">
                    Contact Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="w-6 h-6 text-luxury-gold mt-1" />
                      <div>
                        <p className="font-medium text-luxury-charcoal">Email</p>
                        <a href={`mailto:${content.contact.info.email}`} className="text-luxury-charcoal/80 hover:text-luxury-gold transition-colors duration-300">
                          {content.contact.info.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone className="w-6 h-6 text-luxury-gold mt-1" />
                      <div>
                        <p className="font-medium text-luxury-charcoal">Phone</p>
                        <a href={`tel:${content.contact.info.phone}`} className="text-luxury-charcoal/80 hover:text-luxury-gold transition-colors duration-300">
                          {content.contact.info.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <MapPin className="w-6 h-6 text-luxury-gold mt-1" />
                      <div>
                        <p className="font-medium text-luxury-charcoal">Address</p>
                        <p className="text-luxury-charcoal/80">
                          {content.contact.info.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Clock className="w-6 h-6 text-luxury-gold mt-1" />
                      <div>
                        <p className="font-medium text-luxury-charcoal">Hours</p>
                        <p className="text-luxury-charcoal/80">
                          {content.contact.info.hours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info Card */}
                <div className="bg-luxury-charcoal text-luxury-cream p-8">
                  <h3 className="heading-md text-luxury-gold mb-4">
                    Exclusive Experience
                  </h3>
                  <p className="body-md mb-6 text-primary-foreground">
                    Our curated collection is available for viewing by appointment only. 
                    We provide a personalized experience tailored to your interests and collecting goals.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• Private viewing sessions</li>
                    <li>• Expert consultation</li>
                    <li>• Authentication services</li>
                    <li>• Collection advisory</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Contact;