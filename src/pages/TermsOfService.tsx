import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Terms of Service" description="Terms and conditions for using the Curated Home Source website and purchasing furniture." />
      <Header />
      <main className="pt-[88px]" role="main">
        <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-slate">
          <h1 className="text-4xl font-display font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 4, 2026</p>

          <h2>Acceptance of Terms</h2>
          <p>By accessing and using Curated Home Source, you agree to these Terms of Service. If you do not agree, please do not use our website.</p>

          <h2>Products and Pricing</h2>
          <p>All prices are in USD and subject to change without notice. We strive for accuracy but reserve the right to correct pricing errors. Product images are for illustration and may vary slightly from actual items.</p>

          <h2>Orders and Payment</h2>
          <p>By placing an order, you agree to provide accurate billing and shipping information. We reserve the right to refuse or cancel any order for reasons including product availability, pricing errors, or suspected fraud.</p>

          <h2>Shipping and Delivery</h2>
          <ul>
            <li>Free white-glove delivery on orders over $2,000</li>
            <li>Standard delivery available for smaller orders</li>
            <li>Delivery times vary by location and product availability</li>
            <li>Risk of loss transfers upon delivery to your address</li>
          </ul>

          <h2>Returns and Refunds</h2>
          <p>We offer a 30-day return policy for most items in original condition. Custom and made-to-order items may not be returnable. Return shipping costs may apply. Refunds are processed within 10 business days of receiving the returned item.</p>

          <h2>Warranty</h2>
          <p>Products carry a minimum 1-year manufacturer warranty. Extended warranties up to 10 years are available on select items. Warranty does not cover damage from misuse, neglect, or normal wear and tear.</p>

          <h2>Intellectual Property</h2>
          <p>All content on this website, including text, images, logos, and designs, is the property of Curated Home Source and protected by copyright law.</p>

          <h2>Limitation of Liability</h2>
          <p>Curated Home Source is not liable for indirect, incidental, or consequential damages arising from use of our website or products, to the maximum extent permitted by law.</p>

          <h2>Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:legal@curatedhomesource.com" className="text-accent">legal@curatedhomesource.com</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
