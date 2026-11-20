import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read Supabase environment variables from Vite or process.env
const supabaseUrl: string =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_URL) ||
  "";

const supabaseAnonKey: string =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY) ||
  "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("your-project") &&
      !supabaseAnonKey.includes("your-anon"),
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("enquiries").insert([
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
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
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
  if (!supabase) return false;
  try {
    const { error } = await supabase
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
  if (!supabase) return false;
  try {
    const { error } = await supabase
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
  if (!supabase) return false;
  try {
    const { error } = await supabase
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
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
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
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("reviews").insert([
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
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
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
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("site_settings").upsert({
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
