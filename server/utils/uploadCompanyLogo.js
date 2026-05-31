import { v2 as cloudinary } from "cloudinary";
import { supabase } from "../config/supabase.js";

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_SECRET_KEY
  );

const isSupabaseConfigured = () => Boolean(supabase);

/** Upload recruiter company logo to Cloudinary or Supabase Storage. */
export async function uploadCompanyLogo(file) {
  if (!file?.buffer) {
    throw new Error("No image file received");
  }

  // Try Cloudinary first
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });

    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "company-logos" }
    );
    return result.secure_url;
  }

  // Use Supabase Storage (public bucket) - try 'logos' first, then 'logo'
  if (isSupabaseConfigured()) {
    const safeName = (file.originalname || "logo.png").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${Date.now()}-${safeName}`;

    // Try 'logos' bucket first (plural)
    let result = await supabase.storage
      .from('logos')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || "image/png",
        upsert: false
      });

    let bucketName = 'logos';

    // If 'logos' doesn't exist, try 'logo' (singular)
    if (result.error && result.error.message.includes('not found')) {
      result = await supabase.storage
        .from('logo')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || "image/png",
          upsert: false
        });
      bucketName = 'logo';
    }

    if (result.error) {
      throw new Error(`Logo upload failed: ${result.error.message}`);
    }

    // Get public URL for logos bucket
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(result.data.path);

    return publicUrlData.publicUrl;
  }

  throw new Error(
    "Logo upload is not configured. Add CLOUDINARY_* vars or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to server/.env"
  );
}
