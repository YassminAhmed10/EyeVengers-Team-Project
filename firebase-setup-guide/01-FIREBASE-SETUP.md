# 🔥 Firebase Setup Guide for Beginners

## Part 1: Create Firebase Project

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Click "Create a project"
3. Enter your project name (e.g., "Radiology-Center")
4. Click "Continue"

### Step 2: Enable Google Analytics (Optional)
- You can skip this for now
- Click "Create project"
- Wait for the project to be created (30-60 seconds)

### Step 3: Get Your Firebase Config
1. Click the **Web icon** (</>) to create a web app
2. Enter app nickname: "Radiology Center Web"
3. Click "Register app"
4. **Copy the Firebase Config** (you'll need this!)

Your config will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...mobile"
};
```

**Save this config somewhere safe!**

---

## Part 2: Enable Firebase Services

### Step 1: Enable Authentication
1. In Firebase Console, go to **Authentication** (left menu)
2. Click **"Get started"**
3. Select **Email/Password**
4. Toggle on **Enable**
5. Click **Save**

### Step 2: Enable Firestore Database
1. Go to **Firestore Database** (left menu)
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Choose location: **us-central1** (or closest to you)
5. Click **"Create"**

**⚠️ Important:** Test mode allows anyone to read/write. For production, set proper security rules.

---

## Part 3: Security Rules (Important!)

### For Development (Test Mode):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Go to **Firestore** → **Rules** and paste this.

This allows:
✅ Only logged-in users can read/write
❌ Anonymous users cannot access data

---

## Summary - What You Did:
✅ Created a Firebase project
✅ Got your Firebase config
✅ Enabled Authentication
✅ Enabled Firestore Database
✅ Set security rules

**Next Step:** Connect Firebase to React.js → See `02-REACT-SETUP.md`
