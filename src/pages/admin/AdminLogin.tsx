import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Loader2, Code2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const { signIn, signUp, user } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else if (isSignUp) {
      toast.success("Account created! Check your email to confirm.");
      setIsSignUp(false);
    } else {
      toast.success("Welcome back!");
      navigate("/admin");
    }
  };

  // Clear any stale sessions on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || (session && !session.user)) {
        supabase.auth.signOut();
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(40,18%,97%)] p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-amber-100/40 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-amber-50/30 to-transparent blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-border/40 bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/[0.06]">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Store className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-foreground">Admin Dashboard</CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSignUp ? "Create your admin account" : "Sign in to manage your store"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/20">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white/80 px-3 text-muted-foreground">or</span></div>
            </div>
            <Button onClick={handleDevBypass} disabled={devLoading} variant="outline" className="w-full mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 font-semibold">
              {devLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Code2 className="h-4 w-4 mr-2" />}
              Dev Bypass — Quick Access
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-accent hover:text-accent/80 font-semibold transition-colors">
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
