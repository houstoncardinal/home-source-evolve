import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <SEOHead title="Reset Password" description="Reset your password." />
      <Header />
      <main className="pt-[88px]" role="main">
        <section className="container mx-auto px-4 py-16 max-w-md">
          <Card className="p-8">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-accent" />
                </div>
                <h1 className="text-2xl font-display font-bold">Check Your Email</h1>
                <p className="text-muted-foreground">We've sent a password reset link to <strong>{email}</strong></p>
                <Link to="/login">
                  <Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to Sign In</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-display font-bold mb-2">Reset Password</h1>
                  <p className="text-muted-foreground">Enter your email to receive a reset link</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</> : "Send Reset Link"}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  <Link to="/login" className="text-accent hover:underline"><ArrowLeft className="h-3 w-3 inline mr-1" />Back to Sign In</Link>
                </p>
              </>
            )}
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
