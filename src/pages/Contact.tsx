import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, HeadphonesIcon, Truck, Award } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["1-800-555-1234", "Mon-Fri: 9AM - 6PM EST"],
    description: "Speak with our furniture specialists"
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@curatedhomesource.com", "support@curatedhomesource.com"],
    description: "We respond within 24 hours"
  },
  {
    icon: MapPin,
    title: "Showroom",
    details: ["123 Luxury Lane", "New York, NY 10001"],
    description: "Visit us by appointment"
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Mon-Fri: 9AM - 6PM", "Sat: 10AM - 5PM"],
    description: "Eastern Standard Time"
  }
];

const faqs = [
  {
    question: "What is your delivery process?",
    answer: "We offer free white glove delivery on orders over $2,000. Our professional team will deliver, unpack, and set up your furniture in your desired room. We also offer standard delivery options for smaller orders."
  },
  {
    question: "Do you offer assembly services?",
    answer: "Yes! Our white glove delivery service includes complete assembly of your furniture. Our trained technicians will assemble all pieces and remove all packaging materials."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for most items. Furniture must be in its original condition. Custom orders may have different return terms. Contact our team for specific details."
  },
  {
    question: "Do you offer interior design consultations?",
    answer: "Absolutely! Our design specialists offer complimentary virtual consultations to help you select the perfect furniture for your space. Schedule an appointment through our website."
  },
  {
    question: "What warranty do you offer?",
    answer: "All our furniture comes with a minimum 1-year manufacturer's warranty. Many pieces include extended warranties up to 10 years. Specific warranty information is available on each product page."
  }
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              We'd Love to
              <span className="text-accent"> Hear From You</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Our team is here to help you find the perfect furniture for your home. 
              Whether you have a question about products, delivery, or design consultations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <info.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-sm text-foreground/80 mb-1">{detail}</p>
                ))}
                <p className="text-xs text-muted-foreground mt-3">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
                Send Us a Message
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Let's Start a Conversation
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-700">Thank you for reaching out. We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                      <Input 
                        required
                        placeholder="John Smith"
                        className="h-12 rounded-xl"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                      <Input 
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 rounded-xl"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <Input 
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="h-12 rounded-xl"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                      <Input 
                        required
                        placeholder="How can we help?"
                        className="h-12 rounded-xl"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                    <Textarea 
                      required
                      placeholder="Tell us more about what you're looking for..."
                      className="min-h-[150px] rounded-xl"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-semibold rounded-full text-lg"
                  >
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Quick Contact Options */}
              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-8 border border-accent/10">
                <h3 className="text-xl font-semibold text-foreground mb-6">Other Ways to Reach Us</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Live Chat</h4>
                      <p className="text-sm text-muted-foreground">Chat with us for immediate assistance</p>
                      <button className="text-accent text-sm font-medium mt-1 hover:underline">Start Chat</button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <HeadphonesIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Schedule a Call</h4>
                      <p className="text-sm text-muted-foreground">Book a time that works for you</p>
                      <button className="text-accent text-sm font-medium mt-1 hover:underline">Schedule Now</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-7 w-7 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Free Delivery</h4>
                  <p className="text-xs text-muted-foreground">On orders over $2,000</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-7 w-7 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">10-Year Warranty</h4>
                  <p className="text-xs text-muted-foreground">On all furniture</p>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="relative rounded-2xl overflow-hidden h-64 bg-muted">
                <img 
                  src="https://images.unsplash.com/photo-1496568816309-51d7c20e3b2b?w=800&h=400&fit=crop" 
                  alt="Showroom location"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white rounded-xl px-6 py-4 shadow-xl">
                    <p className="font-semibold text-foreground">Visit Our Showroom</p>
                    <p className="text-sm text-muted-foreground">123 Luxury Lane, New York</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-muted/20 via-background to-muted/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </motion.div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="text-lg font-semibold text-foreground">{faq.question}</span>
                    <span className="ml-4 shrink-0">
                      <svg className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
