import "dotenv/config";
import express from "express";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT) || 3000;
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "a12026";

const DATA_DIR = path.join(process.cwd(), "data");
const ENQUIRIES_FILE =
  process.env.ENQUIRIES_FILE || path.join(DATA_DIR, "enquiries.json");

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "completed"
  | "archived";

export interface StoredEnquiry {
  referenceId: string;
  submittedAt: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  service: string;
  projectType: "Residential" | "Commercial";
  description: string;
  hasPhoto: boolean;
  photoName?: string;
  photoDataUrl?: string;
  status: EnquiryStatus;
  notes?: string;
}

export interface SiteSettings {
  isSiteLive: boolean;
  maintenanceMessage: string;
  updatedAt: string;
}

export interface StoredReview {
  id: string;
  author: string;
  location: string;
  rating: number; // 1 to 5
  serviceType: string;
  headline: string;
  content: string;
  date: string;
  verified: boolean;
  status: "approved" | "pending" | "hidden";
}

const SETTINGS_FILE = path.resolve(process.cwd(), "data", "settings.json");
const REVIEWS_FILE = path.resolve(process.cwd(), "data", "reviews.json");

async function loadReviews(): Promise<StoredReview[]> {
  try {
    const raw = await fs.readFile(REVIEWS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function persistReviews(reviews: StoredReview[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(REVIEWS_FILE), { recursive: true });
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist reviews:", err);
  }
}

const DEFAULT_SETTINGS: SiteSettings = {
  isSiteLive: true,
  maintenanceMessage:
    "Our digital showroom is currently undergoing scheduled enhancements. For immediate tiling enquiries and urgent project quotes across Brisbane, Gold Coast, and Sunshine Coast, please contact our team directly.",
  updatedAt: new Date().toISOString(),
};

async function loadSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      isSiteLive: typeof parsed.isSiteLive === "boolean" ? parsed.isSiteLive : true,
      maintenanceMessage:
        typeof parsed.maintenanceMessage === "string" && parsed.maintenanceMessage.trim().length > 0
          ? parsed.maintenanceMessage
          : DEFAULT_SETTINGS.maintenanceMessage,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    await persistSiteSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
}

async function persistSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist site settings:", err);
  }
}

// Active admin session tokens (in-memory, invalidated on server restart)
const activeSessions = new Set<string>();

function generateToken(): string {
  const token = `a1_admin_${crypto.randomBytes(24).toString("hex")}`;
  activeSessions.add(token);
  return token;
}

function isValidAdmin(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (activeSessions.has(token) || token === ADMIN_PASSWORD) {
      return true;
    }
  }
  const customHeader = req.headers["x-admin-key"] || req.headers["x-admin-password"];
  if (customHeader === ADMIN_PASSWORD) {
    return true;
  }
  return false;
}

const SAMPLE_ENQUIRIES: StoredEnquiry[] = [
  {
    referenceId: "A1-SAMPLE1",
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    fullName: "Michael Henderson",
    phone: "0412 345 678",
    email: "m.henderson@example.com.au",
    location: "Brisbane",
    service: "Wall & Floor Tiling",
    projectType: "Residential",
    description:
      "Renovation of master bathroom and separate ensuite in New Farm. Approx 45sqm wall and floor tiling with 1200x600 porcelain tiles and mitred niche.",
    hasPhoto: false,
    status: "new",
    notes: "Client requested call back after 3pm. Interested in dark slate finish.",
  },
  {
    referenceId: "A1-SAMPLE2",
    submittedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    fullName: "Sarah & David Jenkins",
    phone: "0423 889 900",
    email: "sjenkins.design@example.com",
    location: "Gold Coast",
    service: "Stone Work (Wall & Floor)",
    projectType: "Residential",
    description:
      "Architectural dry-stacked sandstone feature wall for outdoor living pavilion and large bluestone floor pavers around alfresco terrace.",
    hasPhoto: false,
    status: "contacted",
    notes: "Initial phone call completed. Site inspection booked for Thursday morning.",
  },
  {
    referenceId: "A1-SAMPLE3",
    submittedAt: new Date(Date.now() - 3600000 * 52).toISOString(),
    fullName: "Liam O'Connor (Coastal Resorts)",
    phone: "0431 772 119",
    email: "liam@coastalresorts.com.au",
    location: "Sunshine Coast",
    service: "Pool Tiling",
    projectType: "Commercial",
    description:
      "Full waterline mosaic tiling (deep teal glass mosaics) and drop-face limestone pool coping for resort swimming pool in Noosa Heads.",
    hasPhoto: false,
    status: "quoted",
    notes: "Formal quote sent ($18,400 inc GST). Awaiting builder approval.",
  },
];

async function loadEnquiries(): Promise<StoredEnquiry[]> {
  try {
    const raw = await fs.readFile(ENQUIRIES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // File missing or unparseable, seed initial starter records
  }

  // Seed sample records
  try {
    await fs.mkdir(path.dirname(ENQUIRIES_FILE), { recursive: true });
    await fs.writeFile(
      ENQUIRIES_FILE,
      JSON.stringify(SAMPLE_ENQUIRIES, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Failed to seed initial enquiries:", err);
  }
  return [...SAMPLE_ENQUIRIES];
}

async function persistEnquiries(records: StoredEnquiry[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(ENQUIRIES_FILE), { recursive: true });
    await fs.writeFile(
      ENQUIRIES_FILE,
      JSON.stringify(records.slice(0, 500), null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Failed to write enquiry log:", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // Ensure initial data file exists
  await loadEnquiries();
  await loadSiteSettings();

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "A1 Tiling Pty Ltd" });
  });

  // Public endpoint for site status (is site online/maintenance mode)
  app.get("/api/site-settings", async (_req, res) => {
    const settings = await loadSiteSettings();
    res.json({ ok: true, settings });
  });

  // Public client quote submission endpoint
  app.post("/api/enquiries", async (req, res) => {
    const body = req.body ?? {};
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const location = String(body.location ?? "").trim();
    const service = String(body.service ?? "").trim();
    const projectType =
      body.projectType === "Commercial" ? "Commercial" : "Residential";
    const description = String(body.description ?? "").trim();
    const photoName =
      typeof body.photoName === "string" ? body.photoName.trim() : undefined;
    const photoDataUrl =
      typeof body.photoDataUrl === "string" ? body.photoDataUrl : undefined;
    const hasPhoto = Boolean(photoDataUrl);

    // Bot honeypot check
    if (body.company_tax_id) {
      res.json({
        ok: true,
        referenceId: `A1-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        message: "Enquiry received.",
      });
      return;
    }

    // Strict Full Name validation (prevent single names, digits, test words)
    const nameWords = fullName.split(/\s+/).filter(Boolean);
    if (!fullName || fullName.length < 3 || nameWords.length < 2 || /\d/.test(fullName)) {
      res.status(400).json({ error: "Please provide both first and last name (e.g. John Smith)." });
      return;
    }
    const spamNames = ["test", "asdf", "qwerty", "admin", "fake", "spam", "none", "dummy"];
    if (nameWords.some((w) => spamNames.includes(w.toLowerCase()))) {
      res.status(400).json({ error: "Please enter a genuine client name." });
      return;
    }

    // Strict Australian phone validation
    const digits = phone.replace(/\D/g, "");
    const fakeSamples = ["1234567890", "0123456789", "9876543210", "0412345678", "0400000000", "0411111111", "0422222222"];
    if (
      !digits ||
      /^(\d)\1+$/.test(digits) ||
      fakeSamples.includes(digits) ||
      !(
        (digits.startsWith("04") && digits.length === 10) ||
        (digits.startsWith("614") && digits.length === 11) ||
        (digits.startsWith("07") && digits.length === 10) ||
        (digits.startsWith("617") && digits.length === 11) ||
        ((digits.startsWith("02") || digits.startsWith("03") || digits.startsWith("08")) && digits.length === 10)
      )
    ) {
      res.status(400).json({
        error: "Please enter a valid 10-digit Australian phone number (04XX XXX XXX or 07 XXXX XXXX).",
      });
      return;
    }

    // Strict Email validation & fake domain blocking
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const blockedDomains = ["test.com", "example.com", "asdf.com", "fake.com", "none.com", "mailinator.com", "tempmail.com"];
    if (blockedDomains.includes(domain)) {
      res.status(400).json({ error: "Please provide an active, genuine email address." });
      return;
    }

    // Suburb & Location validation
    if (!location || location.length < 4) {
      res.status(400).json({ error: "Please enter your Queensland project suburb and postcode." });
      return;
    }

    if (!service) {
      res.status(400).json({ error: "Please select the required tiling service." });
      return;
    }

    // Description validation (at least 15 characters, no repeating spam)
    if (!description || description.length < 15 || /(.)\1{6,}/.test(description)) {
      res.status(400).json({
        error: "Please provide meaningful details about your tiling scope (minimum 15 characters).",
      });
      return;
    }

    const referenceId = `A1-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const submittedAt = new Date().toISOString();

    const record: StoredEnquiry = {
      referenceId,
      submittedAt,
      fullName,
      phone,
      email,
      location,
      service,
      projectType,
      description,
      hasPhoto,
      photoName,
      photoDataUrl,
      status: "new",
    };

    const records = await loadEnquiries();
    records.unshift(record);
    await persistEnquiries(records);

    res.status(201).json({
      referenceId,
      submittedAt,
      message:
        "Enquiry recorded. For immediate assistance, call 0435 076 111 or send directly via your email client.",
    });
  });

  // ==========================================
  // PUBLIC CLIENT REVIEWS ENDPOINTS
  // ==========================================

  // Public: Get all approved reviews
  app.get("/api/reviews", async (_req, res) => {
    const reviews = await loadReviews();
    const approved = reviews.filter((r) => r.status !== "hidden");
    res.json({ ok: true, reviews: approved });
  });

  // Public: Submit a new review
  app.post("/api/reviews", async (req, res) => {
    const { author, location, rating, serviceType, headline, content } = req.body ?? {};

    if (!author || typeof author !== "string" || author.trim().length < 2) {
      res.status(400).json({ ok: false, error: "Please enter your name (minimum 2 characters)." });
      return;
    }
    if (!content || typeof content !== "string" || content.trim().length < 5) {
      res.status(400).json({ ok: false, error: "Please write a brief review message (minimum 5 characters)." });
      return;
    }

    const numericRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    const now = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dateFormatted = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const newReview: StoredReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: author.trim(),
      location: (location && String(location).trim()) || "Queensland",
      rating: numericRating,
      serviceType: (serviceType && String(serviceType).trim()) || "Tiling Project",
      headline: (headline && String(headline).trim()) || "Outstanding Tiling Craftsmanship",
      content: content.trim(),
      date: dateFormatted,
      verified: true,
      status: "approved",
    };

    const all = await loadReviews();
    all.unshift(newReview);
    await persistReviews(all);

    res.status(201).json({
      ok: true,
      message: "Thank you! Your review has been submitted and published.",
      review: newReview,
    });
  });

  // ==========================================
  // ADMIN AUTHENTICATION & MANAGEMENT ENDPOINTS
  // ==========================================

  // Admin login with password
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body ?? {};
    if (password === ADMIN_PASSWORD) {
      const token = generateToken();
      res.json({
        ok: true,
        token,
        businessName: "A1 Tiling Pty Ltd",
        loginTime: new Date().toISOString(),
      });
    } else {
      res.status(401).json({
        ok: false,
        error: "Incorrect admin password. Please try again.",
      });
    }
  });

  // Verify active session token
  app.get("/api/admin/verify", (req, res) => {
    if (isValidAdmin(req)) {
      res.json({ ok: true, authenticated: true });
    } else {
      res.status(401).json({ ok: false, authenticated: false });
    }
  });

  // Fetch all stored enquiries (protected)
  app.get("/api/admin/enquiries", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const records = await loadEnquiries();
    res.json({ enquiries: records });
  });

  // Update enquiry status / notes (protected)
  app.patch("/api/admin/enquiries/:referenceId", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const { referenceId } = req.params;
    const { status, notes } = req.body ?? {};

    const records = await loadEnquiries();
    const targetIdx = records.findIndex((r) => r.referenceId === referenceId);

    if (targetIdx === -1) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    if (status) {
      records[targetIdx].status = status;
    }
    if (typeof notes === "string") {
      records[targetIdx].notes = notes;
    }

    await persistEnquiries(records);
    res.json({ ok: true, updated: records[targetIdx] });
  });

  // Delete an enquiry (protected)
  app.delete("/api/admin/enquiries/:referenceId", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const { referenceId } = req.params;
    let records = await loadEnquiries();
    records = records.filter((r) => r.referenceId !== referenceId);
    await persistEnquiries(records);
    res.json({ ok: true, deleted: referenceId });
  });

  // Get aggregated stats (protected)
  app.get("/api/admin/stats", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const records = await loadEnquiries();
    const stats = {
      total: records.length,
      newCount: records.filter((r) => r.status === "new").length,
      contactedCount: records.filter((r) => r.status === "contacted").length,
      quotedCount: records.filter((r) => r.status === "quoted").length,
      completedCount: records.filter((r) => r.status === "completed").length,
      byLocation: {
        Brisbane: records.filter((r) => r.location === "Brisbane").length,
        GoldCoast: records.filter((r) => r.location === "Gold Coast").length,
        SunshineCoast: records.filter((r) => r.location === "Sunshine Coast").length,
      },
      byService: records.reduce((acc, curr) => {
        acc[curr.service] = (acc[curr.service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
    res.json({ stats });
  });

  // Change admin password (protected)
  app.post("/api/admin/change-password", (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const { newPassword } = req.body ?? {};
    if (!newPassword || newPassword.length < 4) {
      res.status(400).json({ error: "Password must be at least 4 characters long" });
      return;
    }
    ADMIN_PASSWORD = String(newPassword).trim();
    res.json({ ok: true, message: "Admin password updated successfully" });
  });

  // Toggle Site ON/OFF (Maintenance mode) and update announcement message (protected)
  app.post("/api/admin/site-settings", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const body = req.body ?? {};
    const current = await loadSiteSettings();
    const isSiteLive =
      typeof body.isSiteLive === "boolean" ? body.isSiteLive : current.isSiteLive;
    const maintenanceMessage =
      typeof body.maintenanceMessage === "string" && body.maintenanceMessage.trim().length > 0
        ? body.maintenanceMessage.trim()
        : current.maintenanceMessage;

    const updated: SiteSettings = {
      isSiteLive,
      maintenanceMessage,
      updatedAt: new Date().toISOString(),
    };

    await persistSiteSettings(updated);
    res.json({ ok: true, settings: updated });
  });

  // Admin: Get all reviews
  app.get("/api/admin/reviews", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const all = await loadReviews();
    res.json({ ok: true, reviews: all });
  });

  // Admin: Delete a review
  app.delete("/api/admin/reviews/:id", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const { id } = req.params;
    let all = await loadReviews();
    all = all.filter((r) => r.id !== id);
    await persistReviews(all);
    res.json({ ok: true, deleted: id });
  });

  // Admin: Toggle review status (approved/hidden)
  app.patch("/api/admin/reviews/:id", async (req, res) => {
    if (!isValidAdmin(req)) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const { id } = req.params;
    const { status } = req.body ?? {};
    const all = await loadReviews();
    const idx = all.findIndex((r) => r.id === id);
    if (idx !== -1 && status) {
      all[idx].status = status;
      await persistReviews(all);
      res.json({ ok: true, review: all[idx] });
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  });

  // Serve Single Page Application
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`A1 Tiling Pty Ltd server running on http://localhost:${PORT}`);
    console.log(`Admin panel available on http://localhost:${PORT}/admin (password: ${ADMIN_PASSWORD})`);
  });
}

startServer();
