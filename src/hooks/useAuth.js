import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useAuth(addLog) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    addLog?.("Logout requested");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      addLog?.("Logout success");
    } catch (error) {
      addLog?.("Logout error", error);
      // Force local cleanup anyway
      localStorage.clear();
      setSession(null);
    }
  };

  const handleReset = async () => {
    addLog?.("Resetting app data...");
    localStorage.clear();
    try {
      await supabase.auth.signOut();
      addLog?.("Sign out success");
    } catch (e) {
      addLog?.("Sign out failed, reloading anyway", e);
    }
    window.location.reload();
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        addLog?.("Checking session...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) throw error;

        addLog?.("Session result", currentSession?.user?.email || "No session");
        setSession(currentSession);
      } catch (error) {
        addLog?.("Session init error", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        addLog?.("Auth event", { event, email: currentSession?.user?.email });
        setSession(currentSession);
        if (!currentSession) {
          setLoading(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [addLog]);

  return {
    session,
    loading,
    handleLogout,
    handleReset,
  };
}
