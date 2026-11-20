// ============================================================================
// Australian Client Enquiry Validation & Queensland Suburbs Helper
// Prevents spam, fake numbers, and ensures accurate Australian project data
// ============================================================================

export interface QldSuburb {
  name: string;
  postcode: string;
  region: "Brisbane" | "Gold Coast" | "Sunshine Coast" | "Ipswich & Greater SEQ";
}

export const QLD_SUBURBS: QldSuburb[] = [
  // BRISBANE
  { name: "New Farm", postcode: "4005", region: "Brisbane" },
  { name: "Teneriffe", postcode: "4005", region: "Brisbane" },
  { name: "Newstead", postcode: "4006", region: "Brisbane" },
  { name: "Fortitude Valley", postcode: "4006", region: "Brisbane" },
  { name: "Brisbane City", postcode: "4000", region: "Brisbane" },
  { name: "Spring Hill", postcode: "4000", region: "Brisbane" },
  { name: "Paddington", postcode: "4064", region: "Brisbane" },
  { name: "Milton", postcode: "4064", region: "Brisbane" },
  { name: "Red Hill", postcode: "4059", region: "Brisbane" },
  { name: "Bardon", postcode: "4065", region: "Brisbane" },
  { name: "Rosalie", postcode: "4064", region: "Brisbane" },
  { name: "Bulimba", postcode: "4171", region: "Brisbane" },
  { name: "Hawthorne", postcode: "4171", region: "Brisbane" },
  { name: "Balmoral", postcode: "4171", region: "Brisbane" },
  { name: "Hamilton", postcode: "4007", region: "Brisbane" },
  { name: "Ascot", postcode: "4007", region: "Brisbane" },
  { name: "Clayfield", postcode: "4011", region: "Brisbane" },
  { name: "Hendra", postcode: "4011", region: "Brisbane" },
  { name: "Kangaroo Point", postcode: "4169", region: "Brisbane" },
  { name: "West End", postcode: "4101", region: "Brisbane" },
  { name: "South Brisbane", postcode: "4101", region: "Brisbane" },
  { name: "Highgate Hill", postcode: "4101", region: "Brisbane" },
  { name: "Coorparoo", postcode: "4151", region: "Brisbane" },
  { name: "Camp Hill", postcode: "4152", region: "Brisbane" },
  { name: "Norman Park", postcode: "4170", region: "Brisbane" },
  { name: "Indooroopilly", postcode: "4068", region: "Brisbane" },
  { name: "St Lucia", postcode: "4067", region: "Brisbane" },
  { name: "Toowong", postcode: "4066", region: "Brisbane" },
  { name: "Taringa", postcode: "4068", region: "Brisbane" },
  { name: "Graceville", postcode: "4075", region: "Brisbane" },
  { name: "Chelmer", postcode: "4068", region: "Brisbane" },
  { name: "Kenmore", postcode: "4069", region: "Brisbane" },
  { name: "Chapel Hill", postcode: "4069", region: "Brisbane" },
  { name: "Ashgrove", postcode: "4060", region: "Brisbane" },
  { name: "The Gap", postcode: "4061", region: "Brisbane" },
  { name: "Chermside", postcode: "4032", region: "Brisbane" },
  { name: "Carindale", postcode: "4152", region: "Brisbane" },
  { name: "Manly", postcode: "4179", region: "Brisbane" },
  { name: "Wynnum", postcode: "4178", region: "Brisbane" },
  { name: "Sunnybank", postcode: "4109", region: "Brisbane" },
  { name: "Mount Gravatt", postcode: "4122", region: "Brisbane" },

  // GOLD COAST
  { name: "Main Beach", postcode: "4217", region: "Gold Coast" },
  { name: "Surfers Paradise", postcode: "4217", region: "Gold Coast" },
  { name: "Broadbeach", postcode: "4218", region: "Gold Coast" },
  { name: "Broadbeach Waters", postcode: "4218", region: "Gold Coast" },
  { name: "Mermaid Beach", postcode: "4218", region: "Gold Coast" },
  { name: "Mermaid Waters", postcode: "4218", region: "Gold Coast" },
  { name: "Miami", postcode: "4220", region: "Gold Coast" },
  { name: "Burleigh Heads", postcode: "4220", region: "Gold Coast" },
  { name: "Burleigh Waters", postcode: "4220", region: "Gold Coast" },
  { name: "Palm Beach", postcode: "4221", region: "Gold Coast" },
  { name: "Currumbin", postcode: "4223", region: "Gold Coast" },
  { name: "Currumbin Waters", postcode: "4223", region: "Gold Coast" },
  { name: "Tugun", postcode: "4224", region: "Gold Coast" },
  { name: "Coolangatta", postcode: "4225", region: "Gold Coast" },
  { name: "Robina", postcode: "4226", region: "Gold Coast" },
  { name: "Varsity Lakes", postcode: "4227", region: "Gold Coast" },
  { name: "Southport", postcode: "4215", region: "Gold Coast" },
  { name: "Bundall", postcode: "4217", region: "Gold Coast" },
  { name: "Benowa", postcode: "4217", region: "Gold Coast" },
  { name: "Isle of Capri", postcode: "4217", region: "Gold Coast" },
  { name: "Sanctuary Cove", postcode: "4212", region: "Gold Coast" },
  { name: "Hope Island", postcode: "4212", region: "Gold Coast" },
  { name: "Paradise Point", postcode: "4216", region: "Gold Coast" },
  { name: "Runaway Bay", postcode: "4216", region: "Gold Coast" },
  { name: "Helensvale", postcode: "4212", region: "Gold Coast" },
  { name: "Coomera", postcode: "4209", region: "Gold Coast" },

  // SUNSHINE COAST
  { name: "Noosa Heads", postcode: "4567", region: "Sunshine Coast" },
  { name: "Noosaville", postcode: "4566", region: "Sunshine Coast" },
  { name: "Sunshine Beach", postcode: "4567", region: "Sunshine Coast" },
  { name: "Sunrise Beach", postcode: "4567", region: "Sunshine Coast" },
  { name: "Peregian Beach", postcode: "4573", region: "Sunshine Coast" },
  { name: "Coolum Beach", postcode: "4573", region: "Sunshine Coast" },
  { name: "Maroochydore", postcode: "4558", region: "Sunshine Coast" },
  { name: "Alexandra Headland", postcode: "4572", region: "Sunshine Coast" },
  { name: "Mooloolaba", postcode: "4557", region: "Sunshine Coast" },
  { name: "Buddina", postcode: "4575", region: "Sunshine Coast" },
  { name: "Minyama", postcode: "4575", region: "Sunshine Coast" },
  { name: "Kawana Waters", postcode: "4575", region: "Sunshine Coast" },
  { name: "Caloundra", postcode: "4551", region: "Sunshine Coast" },
  { name: "Kings Beach", postcode: "4551", region: "Sunshine Coast" },
  { name: "Pelican Waters", postcode: "4551", region: "Sunshine Coast" },
  { name: "Golden Beach", postcode: "4551", region: "Sunshine Coast" },
  { name: "Buderim", postcode: "4556", region: "Sunshine Coast" },
  { name: "Sippy Downs", postcode: "4556", region: "Sunshine Coast" },
  { name: "Bli Bli", postcode: "4560", region: "Sunshine Coast" },
  { name: "Maleny", postcode: "4552", region: "Sunshine Coast" },
  { name: "Montville", postcode: "4560", region: "Sunshine Coast" },

  // IPSWICH & GREATER SEQ
  { name: "Ipswich", postcode: "4305", region: "Ipswich & Greater SEQ" },
  { name: "Springfield", postcode: "4300", region: "Ipswich & Greater SEQ" },
  { name: "Springfield Lakes", postcode: "4300", region: "Ipswich & Greater SEQ" },
  { name: "Brookwater", postcode: "4300", region: "Ipswich & Greater SEQ" },
  { name: "Cleveland", postcode: "4163", region: "Ipswich & Greater SEQ" },
  { name: "Redland Bay", postcode: "4165", region: "Ipswich & Greater SEQ" },
  { name: "Victoria Point", postcode: "4165", region: "Ipswich & Greater SEQ" },
  { name: "North Lakes", postcode: "4509", region: "Ipswich & Greater SEQ" },
  { name: "Redcliffe", postcode: "4020", region: "Ipswich & Greater SEQ" },
  { name: "Scarborough", postcode: "4020", region: "Ipswich & Greater SEQ" },
];

export const REGIONS = [
  "Brisbane",
  "Gold Coast",
  "Sunshine Coast",
  "Ipswich & Greater SEQ",
] as const;

export type QldRegion = (typeof REGIONS)[number];

// ----------------------------------------------------------------------------
// 1. Australian Phone Number Formatter & Masker
// ----------------------------------------------------------------------------
export function formatAustralianPhone(input: string): string {
  if (!input) return "";

  // Strip anything that is not a digit or leading +
  const hasPlus = input.trim().startsWith("+");
  let digits = input.replace(/\D/g, "");

  // If user entered +61 international prefix
  if (hasPlus || digits.startsWith("61")) {
    if (digits.startsWith("61")) {
      digits = digits.slice(2);
    }
    // Mobile: +61 4XX XXX XXX
    if (digits.startsWith("4")) {
      if (digits.length <= 1) return `+61 4`;
      if (digits.length <= 3) return `+61 4${digits.slice(1)}`;
      if (digits.length <= 6)
        return `+61 4${digits.slice(1, 3)} ${digits.slice(3)}`;
      return `+61 4${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
    // Landline: +61 7 XXXX XXXX
    if (digits.length <= 1) return `+61 ${digits}`;
    if (digits.length <= 5)
      return `+61 ${digits.slice(0, 1)} ${digits.slice(1)}`;
    return `+61 ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
  }

  // If starts with 4 (e.g., user started typing 412345678 without 0)
  if (digits.startsWith("4") && digits.length <= 9) {
    digits = "0" + digits;
  }

  // Mobile: 04XX XXX XXX (10 digits)
  if (digits.startsWith("04")) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  }

  // QLD / AU Landline: 07 XXXX XXXX
  if (
    digits.startsWith("07") ||
    digits.startsWith("02") ||
    digits.startsWith("03") ||
    digits.startsWith("08")
  ) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
  }

  return digits.slice(0, 10);
}

// ----------------------------------------------------------------------------
// 2. Australian Phone Strict Validator
// ----------------------------------------------------------------------------
export function validateAustralianPhone(phone: string): {
  valid: boolean;
  error?: string;
} {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return { valid: false, error: "Australian phone number is required." };
  }

  // Reject repeating numbers e.g. 0000000000, 1111111111
  if (/^(\d)\1+$/.test(digits)) {
    return {
      valid: false,
      error: "Please enter your actual phone number, not repeated digits.",
    };
  }

  // Reject sequential fake samples e.g. 1234567890, 0123456789, 0400000000
  const fakeSamples = [
    "1234567890",
    "0123456789",
    "9876543210",
    "0412345678",
    "0400000000",
    "0411111111",
    "0422222222",
    "0433333333",
    "0499999999",
  ];
  if (fakeSamples.includes(digits)) {
    return {
      valid: false,
      error: "Please enter your real Australian contact number.",
    };
  }

  // Mobile check: 04XXXXXXXX (10 digits) or +614XXXXXXXX (11 digits)
  const isMobile =
    (digits.startsWith("04") && digits.length === 10) ||
    (digits.startsWith("614") && digits.length === 11);

  // Landline check: 07XXXXXXXX (QLD 10 digits) or +617XXXXXXXX
  const isLandline =
    (digits.startsWith("07") && digits.length === 10) ||
    (digits.startsWith("617") && digits.length === 11) ||
    ((digits.startsWith("02") || digits.startsWith("03") || digits.startsWith("08")) &&
      digits.length === 10);

  if (!isMobile && !isLandline) {
    return {
      valid: false,
      error:
        "Must be a valid 10-digit Australian Mobile (e.g. 0412 345 678) or QLD landline (07 XXXX XXXX).",
    };
  }

  return { valid: true };
}

// ----------------------------------------------------------------------------
// 3. Full Name Validator
// ----------------------------------------------------------------------------
export function validateFullName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter your full name." };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: "Full name must be at least 3 characters." };
  }
  // No numbers allowed in name
  if (/\d/.test(trimmed)) {
    return { valid: false, error: "Name cannot contain numbers." };
  }
  // Check for minimum 2 words (first & last name)
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return {
      valid: false,
      error: "Please provide both first and last name (e.g. John Smith).",
    };
  }

  // Check against obvious test/spam words
  const spamWords = [
    "test",
    "asdf",
    "qwerty",
    "admin",
    "fake",
    "spam",
    "none",
    "user",
    "dummy",
    "testing",
    "demo",
    "xxxx",
    "yyyy",
  ];
  for (const word of words) {
    if (spamWords.includes(word.toLowerCase())) {
      return { valid: false, error: "Please provide a genuine full name." };
    }
  }

  return { valid: true };
}

// ----------------------------------------------------------------------------
// 4. Email Validator with Fake Domain Detection
// ----------------------------------------------------------------------------
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: "Email address is required." };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  const [user, domain] = trimmed.toLowerCase().split("@");
  const blockedDomains = [
    "test.com",
    "example.com",
    "asdf.com",
    "fake.com",
    "none.com",
    "mailinator.com",
    "tempmail.com",
    "123.com",
    "dummy.com",
  ];

  if (blockedDomains.includes(domain)) {
    return {
      valid: false,
      error: "Please provide an active, genuine email address.",
    };
  }

  if (user === "test" || user === "asdf" || user === "admin" || user === "fake") {
    return {
      valid: false,
      error: "Please enter a genuine personal or business email.",
    };
  }

  return { valid: true };
}

// ----------------------------------------------------------------------------
// 5. Queensland Suburb & Postcode Validator
// ----------------------------------------------------------------------------
export function validateSuburbAndPostcode(
  suburb: string,
  postcode: string,
): { valid: boolean; error?: string } {
  const subTrim = suburb.trim();
  const postTrim = postcode.trim();

  if (!subTrim || subTrim.length < 2) {
    return {
      valid: false,
      error: "Please enter your project suburb (e.g. New Farm, Main Beach).",
    };
  }
  if (/\d/.test(subTrim)) {
    return {
      valid: false,
      error: "Suburb name should only contain letters and spaces.",
    };
  }
  if (!postTrim) {
    return {
      valid: false,
      error: "Please enter a 4-digit Australian postcode.",
    };
  }
  if (!/^\d{4}$/.test(postTrim)) {
    return {
      valid: false,
      error: "Postcode must be exactly 4 digits (e.g. 4005, 4217, 4567).",
    };
  }

  // Queensland postcodes are predominantly 4000-4999 (or 2485/2486 for Tweed Heads on QLD border)
  const codeNum = parseInt(postTrim, 10);
  const isQld =
    (codeNum >= 4000 && codeNum <= 4999) ||
    codeNum === 2485 ||
    codeNum === 2486;

  if (!isQld) {
    return {
      valid: false,
      error:
        "Postcode should be in Queensland or border region (typically 4000–4999).",
    };
  }

  return { valid: true };
}

// ----------------------------------------------------------------------------
// 6. Project Scope / Description Validator
// ----------------------------------------------------------------------------
export function validateProjectDescription(desc: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = desc.trim();
  if (!trimmed || trimmed.length < 15) {
    return {
      valid: false,
      error:
        "Please provide brief project details (at least 15 characters, e.g. room size, tile preferences).",
    };
  }

  // Reject gibberish like aaaaaaaaa or asdfasdf
  if (/(.)\1{6,}/.test(trimmed)) {
    return {
      valid: false,
      error: "Please enter meaningful project details.",
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return {
      valid: false,
      error:
        "Please describe the scope in a few words (e.g. ensuite renovation 1200x600 tiles).",
    };
  }

  return { valid: true };
}
