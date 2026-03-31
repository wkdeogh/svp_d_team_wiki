'use client';

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export function useViewer() {
  const client = useMemo(() => getBrowserSupabase(), []);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!client) {
        if (active) {
          setLoadingUser(false);
        }
        return;
      }

      const { data } = await client.auth.getUser();
      if (active) {
        setUser(data.user ?? null);
        setLoadingUser(false);
      }
    }

    loadUser();

    if (!client) return () => {
      active = false;
    };

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    let active = true;

    async function loadAdminSession() {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const data = await response.json();
        if (active) {
          setIsAdmin(Boolean(data.authenticated));
        }
      } catch {
        if (active) {
          setIsAdmin(false);
        }
      } finally {
        if (active) {
          setLoadingAdmin(false);
        }
      }
    }

    loadAdminSession();

    function handleFocus() {
      loadAdminSession();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return {
    client,
    user,
    isAdmin,
    loading: loadingUser || loadingAdmin,
  };
}
