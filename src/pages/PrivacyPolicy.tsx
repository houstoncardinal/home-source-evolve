import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Privacy Policy" description="Learn how Curated Home Source collects, uses, and protects your personal information." />
      <Header />
      <main className="pt-[88px]" role="main">
        <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-slate">
          <h1 className="text-4xl font-display font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 4, 2026</p>

          <h2>Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email address, shipping address, and payment information when you make a purchase. We also collect browsing data to improve your shopping experience.</p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate about your orders and account</li>
            <li>Send promotional emails (with your consent)</li>
            <li>Improve our website and customer experience</li>
            <li>Prevent fraud and ensure security</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We do not sell your personal information. We share data only with service providers who help us operate our business (payment processors, shipping carriers) and when required by law.</p>

          <h2>Data Security</h2>
          <p>We use industry-standard encryption and security measures to protect your personal information. Payment data is processed securely through certified payment processors.</p>

          <h2>Cookies</h2>
          <p>We use cookies to remember your preferences, keep items in your cart, and analyze site traffic. You can control cookie settings through your browser.</p>

          <h2>Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@curatedhomesource.com.</p>

          <h2>Contact Us</h2>
          <p>For privacy-related questions, email us at <a href="mailto:privacy@curatedhomesource.com" className="text-accent">privacy@curatedhomesource.com</a> or call 1-800-555-1234.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
