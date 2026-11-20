import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let cachedKey = "";

// ----------------------------------------------------------------------------
// Supabase Configuration Loader
// Checks Vite env, Node process.env, and localStorage
// ----------------------------------------------------------------------------
export function getSupabaseConfig(): { url: string; anonKey: string } {
  let url =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_URL) ||
    "";
  let anonKey =
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY) ||
    "";

  // Check localStorage if not in env (enables in-browser setup on Vercel)
  if ((!url || !anonKey) && typeof window !== "undefined") {
    try {
      const storedUrl = localStorage.getItem("a1_supabase_url");
      const storedKey = localStorage.getItem("a1_supabase_anon_key");
      if (storedUrl && storedKey) {
        url = storedUrl;
        anonKey = storedKey;
      }
    } catch {}
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
      anonKey &&
      url.startsWith("https://") &&
      anonKey.length > 20 &&
      !url.includes("your-project") &&
      !anonKey.includes("your-anon"),
  );
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return null;

  const currentKey = `${url}|${anonKey}`;
  if (cachedClient && cachedKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    cachedKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("a1_supabase_url", url.trim());
    localStorage.setItem("a1_supabase_anon_key", anonKey.trim());
    cachedClient = null;
    cachedKey = "";
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("a1_supabase_url");
    localStorage.removeItem("a1_supabase_anon_key");
    cachedClient = null;
    cachedKey = "";
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string,
): Promise<{ ok: boolean; error?: string; count?: number }> {
  try {
    const testClient = createClient(url.trim(), anonKey.trim());
    const { count, error } = await testClient
      .from("enquiries")
      .select("*", { count: "exact", head: true });

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, count: count ?? 0 };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Connection failed" };
  }
}

export const supabase = getSupabase();

export interface SupabaseEnquiry {
  id?: string;
  reference_id: string;
  submitted_at?: string;
  full_name: string;
  phone: string;
  email: string;
  location: string;
  service: string;
  project_type: string;
  description: string;
  photo_name?: string | null;
  photo_data_url?: string | null;
  status?: string;
  notes?: string | null;
}

export interface SupabaseReview {
  id?: string;
  author: string;
  location: string;
  rating: number;
  service_type: string;
  headline: string;
  content: string;
  date: string;
  verified?: boolean;
  status?: string;
}

// ----------------------------------------------------------------------
// ENQUIRIES HELPERS
// ----------------------------------------------------------------------

export async function insertEnquiryToSupabase(data: {
  referenceId: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  service: string;
  projectType: string;
  description: string;
  photoName?: string;
  photoDataUrl?: string;
  status?: string;
  notes?: string;
}): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from("enquiries").insert([
      {
        reference_id: data.referenceId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        location: data.location,
        service: data.service,
        project_type: data.projectType,
        description: data.description,
        photo_name: data.photoName || null,
        photo_data_url: data.photoDataUrl || null,
        status: data.status || "new",
        notes: data.notes || null,
        submitted_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.warn("Supabase insert enquiry error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase insert enquiry failed:", err);
    return false;
  }
}

export async function fetchEnquiriesFromSupabase(): Promise<any[] | null> {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("enquiries")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch enquiries error:", error.message);
      return null;
    }
    return (
      data?.map((row) => ({
        referenceId: row.reference_id,
        submittedAt: row.submitted_at || row.created_at,
        fullName: row.full_name,
        phone: row.phone,
        email: row.email,
        location: row.location,
        service: row.service,
        projectType: row.project_type,
        description: row.description,
        hasPhoto: Boolean(row.photo_name || row.photo_data_url),
        photoName: row.photo_name || undefined,
        photoDataUrl: row.photo_data_url || undefined,
        status: row.status || "new",
        notes: row.notes || undefined,
      })) || []
    );
  } catch (err) {
    console.warn("Supabase fetch enquiries failed:", err);
    return null;
  }
}

export async function updateEnquiryStatusInSupabase(
  referenceId: string,
  status: string,
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client
      .from("enquiries")
      .update({ status })
      .eq("reference_id", referenceId);
    return !error;
  } catch {
    return false;
  }
}

export async function updateEnquiryNotesInSupabase(
  referenceId: string,
  notes: string,
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client
      .from("enquiries")
      .update({ notes })
      .eq("reference_id", referenceId);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteEnquiryFromSupabase(
  referenceId: string,
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client
      .from("enquiries")
      .delete()
      .eq("reference_id", referenceId);
    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------
// REVIEWS HELPERS
// ----------------------------------------------------------------------

export async function fetchReviewsFromSupabase(): Promise<any[] | null> {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch reviews error:", error.message);
      return null;
    }
    return (
      data?.map((row) => ({
        id: row.id,
        author: row.author,
        location: row.location,
        rating: row.rating,
        serviceType: row.service_type,
        headline: row.headline,
        content: row.content,
        date: row.date,
        verified: row.verified !== false,
        status: row.status || "approved",
      })) || []
    );
  } catch (err) {
    console.warn("Supabase fetch reviews failed:", err);
    return null;
  }
}

export async function insertReviewToSupabase(data: {
  id?: string;
  author: string;
  location: string;
  rating: number;
  serviceType: string;
  headline: string;
  content: string;
  date: string;
}): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from("reviews").insert([
      {
        id: data.id || `rev-${Date.now()}`,
        author: data.author,
        location: data.location,
        rating: data.rating,
        service_type: data.serviceType,
        headline: data.headline,
        content: data.content,
        date: data.date,
        verified: true,
        status: "approved",
      },
    ]);
    if (error) {
      console.warn("Supabase insert review error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase insert review failed:", err);
    return false;
  }
}

// ----------------------------------------------------------------------
// SITE SETTINGS HELPERS
// ----------------------------------------------------------------------

export async function fetchSiteSettingsFromSupabase(): Promise<{
  isSiteLive: boolean;
  maintenanceMessage: string;
} | null> {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("site_settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (error || !data) return null;
    return {
      isSiteLive: data.is_site_live !== false,
      maintenanceMessage: data.maintenance_message || "",
    };
  } catch {
    return null;
  }
}

export async function updateSiteSettingsInSupabase(settings: {
  isSiteLive: boolean;
  maintenanceMessage: string;
}): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from("site_settings").upsert({
      id: "global",
      is_site_live: settings.isSiteLive,
      maintenance_message: settings.maintenanceMessage,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
