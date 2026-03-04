import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Loader2, Code2 } from "lucide-react";
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
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      if (isSignUp) {
        toast.success("Account created! Check your email to confirm, or sign in directly.");
        setIsSignUp(false);
      } else {
        toast.success("Welcome back!");
        navigate("/admin");
      }
    }
  };

  const handleDevBypass = async () => {
    setDevLoading(true);
    const devEmail = "dev@curatedhomesource.com";
    const devPassword = "dev-admin-2026!";

    // Try signing in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    });

    if (signInError) {
      // If sign in fails, create the account then sign in
      const { error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
      });

      if (signUpError) {
        toast.error("Dev bypass failed: " + signUpError.message);
        setDevLoading(false);
        return;
      }

      // Try signing in again after signup
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });

      if (retryError) {
        toast.error("Dev account created but sign-in failed. Try again or check email confirmation settings.");
        setDevLoading(false);
        return;
      }
    }

    toast.success("Dev mode activated!");
    setDevLoading(false);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center">
            <Store className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">Admin Dashboard</CardTitle>
            <CardDescription className="text-slate-400">
              {isSignUp ? "Create your admin account" : "Sign in to manage your store"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-800/80 px-2 text-slate-500">or</span>
              </div>
            </div>
            <Button
              onClick={handleDevBypass}
              disabled={devLoading}
              variant="outline"
              className="w-full mt-4 border-emerald-600/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/60"
            >
              {devLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Code2 className="h-4 w-4 mr-2" />
              )}
              Dev Bypass — Quick Access
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Create one"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
