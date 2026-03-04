import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAdminAuth();
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setRoleChecked(true); return; }
    
    const checkRole = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
      setRoleChecked(true);
    };
    checkRole();
  }, [user]);

  if (loading || !roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-pulse">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have admin privileges. Contact an administrator to request access.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-accent hover:text-accent/80 text-sm font-semibold transition-colors"
          >
            Sign out and try a different account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(40,18%,97%)]">
      <AdminSidebar />
      <main className="lg:ml-[264px] min-h-screen transition-all duration-300">
        <div className="p-5 lg:p-8 max-w-[1440px]">
          {children}
        </div>
      </main>
    </div>
  );
}
