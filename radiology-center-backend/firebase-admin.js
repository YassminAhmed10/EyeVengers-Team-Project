import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Firebase Admin SDK
 * Requires Firebase Admin private key file at: firebase-admin-key.json
 * 
 * To get this file:
 * 1. Go to Firebase Console
 * 2. Project Settings > Service Accounts
 * 3. Click "Generate New Private Key"
 * 4. Save as "firebase-admin-key.json" in the project root
 */
export const initializeFirebaseAdmin = () => {
  try {
    // Try to load from environment variable first
    if (process.env.FIREBASE_ADMIN_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized from environment variable");
      return;
    }

    // Otherwise try to load from file
    const keyPath = path.join(process.cwd(), "firebase-admin-key.json");
    
    if (!fs.existsSync(keyPath)) {
      console.warn("⚠️  firebase-admin-key.json not found. Firebase Admin features will not work.");
      console.warn("   To enable Firebase features, add your service account key:");
      console.warn("   1. Go to Firebase Console > Project Settings > Service Accounts");
      console.warn("   2. Click 'Generate New Private Key'");
      console.warn("   3. Save the JSON file as 'firebase-admin-key.json' in project root");
      return;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized from file");
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error.message);
    console.error("   Make sure firebase-admin-key.json is valid and properly formatted");
  }
};

export default admin;
