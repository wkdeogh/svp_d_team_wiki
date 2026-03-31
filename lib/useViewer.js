'use client';

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export function emitViewerChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("viewer-change"));
}

export function useViewer() {
  const client = useMemo(() => getBrowserSupabase(), []);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await response.json();
        if (active) {
          setUser(data.user ?? null);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    function handleViewerChanged() {
      loadUser();
    }

    window.addEventListener("viewer-change", handleViewerChanged);

    return () => {
      active = false;
      window.removeEventListener("viewer-change", handleViewerChanged);
    };
  }, []);

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

    function handleViewerChanged() {
      loadAdminSession();
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("viewer-change", handleViewerChanged);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("viewer-change", handleViewerChanged);
    };
  }, []);

  return {
    client,
    user,
    isAdmin,
    loading: loadingUser || loadingAdmin,
  };
}
