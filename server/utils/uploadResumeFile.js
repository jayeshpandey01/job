import { v2 as cloudinary } from "cloudinary";
import { supabase } from "../config/supabase.js";

const SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_SECRET_KEY
  );

const isSupabaseConfigured = () => Boolean(supabase);

/** Resolve a fresh signed URL from a storage path or pass through HTTPS URLs. */
export async function getSignedResumeUrl(storagePath) {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }

  // Supabase Storage path - try both 'resume' and 'resumes' bucket names
  if (isSupabaseConfigured()) {
    // Try 'resume' first (singular)
    let result = await supabase.storage
      .from('resume')
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
    
    if (result.error) {
      // Try 'resumes' (plural) as fallback
      result = await supabase.storage
        .from('resumes')
        .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
    }
    
    if (result.error) {
      console.error('Error creating signed URL:', result.error.message);
      return null;
    }
    return result.data.signedUrl;
  }

  return null;
}

/**
 * Upload a resume file. Returns a short-lived signed URL and a stable storagePath
 * (Cloudinary HTTPS URL for Cloudinary uploads, Supabase path for Supabase Storage).
 */
export async function uploadResumeFile(file) {
  if (!file?.buffer) {
    throw new Error("No resume file received");
  }

  // Try Cloudinary first
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });

    const dataUri = `data:${file.mimetype || "application/pdf"};base64,${file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "resumes",
      resource_type: "auto",
    });
    return { url: result.secure_url, storagePath: result.secure_url };
  }

  // Use Supabase Storage - try 'resume' bucket first (singular)
  if (isSupabaseConfigured()) {
    const safeName = (file.originalname || "resume.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${Date.now()}-${safeName}`;

    let result = await supabase.storage
      .from('resume')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || "application/pdf",
        upsert: false
      });

    // If 'resume' bucket doesn't exist, try 'resumes'
    if (result.error && result.error.message.includes('not found')) {
      result = await supabase.storage
        .from('resumes')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || "application/pdf",
          upsert: false
        });
    }

    if (result.error) {
      throw new Error(`Resume upload failed: ${result.error.message}`);
    }

    const url = await getSignedResumeUrl(result.data.path);
    return { url, storagePath: result.data.path };
  }

  throw new Error(
    "Resume upload is not configured. Add CLOUDINARY_* vars or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to server/.env"
  );
}
