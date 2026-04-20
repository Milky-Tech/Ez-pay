"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function readCache(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export const useLandlordData = (user: any, token: string | null) => {
  const [landlordData, setLandlordData] = useState<any | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    profile: false,
    properties: false,
    drafts: false,
    applications: false,
  });
  const { toast } = useToast();

  const fetchLandlordProfile = useCallback(async () => {
    if (!token || !user?.id) return;
    const cacheKey = `landlord_profile_${user.id}`;

    // Serve stale cache immediately
    const cached = readCache(cacheKey);
    if (cached) setLandlordData(cached);

    try {
      setLoading((prev) => ({ ...prev, profile: true }));
      const response = await fetch(`${API_BASE_URL}/landlords/${user.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fresh = data.data || data;
        setLandlordData(fresh);
        writeCache(cacheKey, fresh);
      } else {
        throw new Error("Failed to fetch landlord profile");
      }
    } catch (error) {
      console.error("Error fetching landlord profile:", error);
      if (!cached) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, [token, user?.id, toast]);

  const fetchLandlordProperties = useCallback(async () => {
    if (!token) return;
    const cacheKey = `landlord_properties_${user?.id}`;

    const cached = readCache(cacheKey);
    if (cached) setProperties(cached);

    try {
      setLoading((prev) => ({ ...prev, properties: true }));
      const response = await fetch(`${API_BASE_URL}/listings/landlord/${user?.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fresh = data.data || data || [];
        setProperties(fresh);
        writeCache(cacheKey, fresh);
      } else {
        throw new Error("Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      if (!cached) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load properties",
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, properties: false }));
    }
  }, [token, user?.id, toast]);

  const fetchDrafts = useCallback(async () => {
    if (!token) return;
    const cacheKey = `landlord_drafts_${user?.id}`;

    const cached = readCache(cacheKey);
    if (cached) setDrafts(cached);

    try {
      setLoading((prev) => ({ ...prev, drafts: true }));
      const response = await fetch(`${API_BASE_URL}/listings/drafts`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fresh = data.data || data || [];
        setDrafts(fresh);
        writeCache(cacheKey, fresh);
      } else {
        console.warn("Could not fetch drafts");
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, drafts: false }));
    }
  }, [token, user?.id]);

  const fetchApplications = useCallback(
    async (currentProperties: any[]) => {
      if (!token || currentProperties.length === 0) {
        setApplications([]);
        return;
      }
      const cacheKey = `landlord_applications_${user?.id}`;

      const cached = readCache(cacheKey);
      if (cached) setApplications(cached);

      try {
        setLoading((prev) => ({ ...prev, applications: true }));
        const response = await fetch(`${API_BASE_URL}/applications/apply`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const allApplications = data.data || data || [];
          const landlordApplications = allApplications.filter((app: any) =>
            currentProperties.some((prop) => prop.id === app.property_id),
          );
          setApplications(landlordApplications);
          writeCache(cacheKey, landlordApplications);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading((prev) => ({ ...prev, applications: false }));
      }
    },
    [token, user?.id],
  );

  useEffect(() => {
    if (token && user?.id) {
      fetchLandlordProfile();
      fetchLandlordProperties();
      fetchDrafts();
    }
  }, [token, user?.id, fetchLandlordProfile, fetchLandlordProperties, fetchDrafts]);

  useEffect(() => {
    if (properties.length > 0) {
      fetchApplications(properties);
    } else {
      setApplications([]);
    }
  }, [properties, fetchApplications]);

  const refreshData = () => {
    fetchLandlordProperties();
    fetchDrafts();
    fetchApplications(properties);
  };

  return {
    landlordData,
    properties,
    drafts,
    applications,
    loading,
    refreshData,
    setLandlordData,
  };
};
