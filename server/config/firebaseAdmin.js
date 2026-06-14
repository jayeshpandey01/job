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
    join(serverDir, "serviceAccountKey.json"),
  ].filter(Boolean);

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
  let serviceAccount;
  let credentialPath = "Environment Variable";

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    credentialPath = resolveCredentialPath();

    if (!credentialPath) {
      throw new Error(
        "No service account JSON found. Add serviceAccountKey.json or a *firebase-adminsdk*.json file to the server folder, or set FIREBASE_SERVICE_ACCOUNT_JSON env variable."
      );
    }
    serviceAccount = JSON.parse(readFileSync(credentialPath, "utf8"));
  }
  // New Firebase projects use PROJECT_ID.firebasestorage.app (not .appspot.com)
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    `${serviceAccount.project_id}.firebasestorage.app`;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });

  db = admin.firestore();
  auth = admin.auth();
  console.log(`Firebase Admin SDK initialized (${credentialPath})`);
  console.log(`Firebase Storage bucket: ${storageBucket}`);
} catch (error) {
  console.error("===============================================================");
  console.error("CRITICAL ERROR: Firebase Admin SDK could not initialize.");
  console.error("Place your Firebase service account JSON in the server directory.");
  console.error("Accepted names: serviceAccountKey.json or *firebase-adminsdk*.json");
  console.error("Details:", error.message);
  console.error("===============================================================");
  throw error;
}

export { db, auth };
export default admin;
