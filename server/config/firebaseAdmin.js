import admin from "firebase-admin";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;
let auth = null;

const resolveCredentialPath = () => {
  const cwd = process.cwd();
  const serverDir = join(__dirname, "..");
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    join(cwd, "serviceAccountKey.json"),
    join(cwd, "server", "serviceAccountKey.json"),
    join(serverDir, "serviceAccountKey.json"),
    join(cwd, "server", "jobfinder-de280-firebase-adminsdk-fbsvc-9b2e4d657d.json"),
    join(serverDir, "jobfinder-de280-firebase-adminsdk-fbsvc-9b2e4d657d.json"),
  ].filter(Boolean);

  // Auto-detect in server directory
  try {
    const files = readdirSync(serverDir);
    const autoDetected = files.find(
      (file) => file.includes("firebase-adminsdk") && file.endsWith(".json")
    );
    if (autoDetected) {
      candidates.push(join(serverDir, autoDetected));
    }
  } catch {
    // ignore
  }

  // Auto-detect in server folder under cwd (common in Vercel monorepos)
  try {
    const serverFolder = join(cwd, "server");
    if (existsSync(serverFolder)) {
      const files = readdirSync(serverFolder);
      const autoDetected = files.find(
        (file) => file.includes("firebase-adminsdk") && file.endsWith(".json")
      );
      if (autoDetected) {
        candidates.push(join(serverFolder, autoDetected));
      }
    }
  } catch {
    // ignore
  }

  // Auto-detect in cwd
  try {
    const files = readdirSync(cwd);
    const autoDetected = files.find(
      (file) => file.includes("firebase-adminsdk") && file.endsWith(".json")
    );
    if (autoDetected) {
      candidates.push(join(cwd, autoDetected));
    }
  } catch {
    // ignore
  }

  for (const credentialPath of candidates) {
    if (credentialPath && existsSync(credentialPath)) {
      return credentialPath;
    }
  }

  return null;
};

try {
  let serviceAccount = null;
  let credentialPath = "Environment Variable";

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      let jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
      // Remove any surrounding single quotes that might be present
      if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) {
        jsonStr = jsonStr.slice(1, -1);
      }
      serviceAccount = JSON.parse(jsonStr);
      if (serviceAccount.private_key) {
        // Fix for private keys with escaped newlines
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
    } catch (parseErr) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env variable, falling back to file:", parseErr.message);
    }
  }

  if (!serviceAccount) {
    credentialPath = resolveCredentialPath();

    if (!credentialPath) {
      throw new Error(
        "No service account JSON found. Add serviceAccountKey.json or a *firebase-adminsdk*.json file to the server folder, or set FIREBASE_SERVICE_ACCOUNT_JSON env variable."
      );
    }
    serviceAccount = JSON.parse(readFileSync(credentialPath, "utf8"));
  }

  // Use storage bucket from env or build it from project id
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (serviceAccount && serviceAccount.project_id ? `${serviceAccount.project_id}.firebasestorage.app` : "");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });

  db = admin.firestore();
  auth = admin.auth();
  console.log(`Firebase Admin SDK initialized successfully (${credentialPath})`);
  console.log(`Firebase Storage bucket: ${storageBucket}`);
} catch (error) {
  console.error("===============================================================");
  console.error("CRITICAL WARNING: Firebase Admin SDK could not initialize.");
  console.error("Details:", error.message);
  console.error("API calls requiring Firestore or Auth will return 500 errors.");
  console.error("===============================================================");
  // Note: We do NOT throw the error here to prevent crashing the serverless startup process.
  // Instead, the middlewares will check for !db or !auth and return descriptive JSON errors.
}

export { db, auth };
export default admin;

