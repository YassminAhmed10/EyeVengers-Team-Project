# Firebase Integration - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RADIOLOGY CENTER APP                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (React/Vite)                     │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │           React App Root (main.jsx)                   │ │  │
│  │  │  <AuthProvider>                                       │ │  │
│  │  │    <App />                                           │ │  │
│  │  │  </AuthProvider>                                      │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                           │                                 │  │
│  │                           ▼                                 │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │        AuthContext.jsx (Global Auth State)            │ │  │
│  │  │  - currentUser                                        │ │  │
│  │  │  - userToken (idToken)                               │ │  │
│  │  │  - loading                                           │ │  │
│  │  │  - logout()                                          │ │  │
│  │  │                                                      │ │  │
│  │  │  Listens to: onAuthStateChanged from Firebase       │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │     │                    │                    │              │  │
│  │     │                    │                    │              │  │
│  │     ▼                    ▼                    ▼              │  │
│  │  RegisterPage        LoginPage          Other Pages       │  │
│  │  ├── Uses                ├── Uses         ├── Uses         │  │
│  │  │   useContext          │   useContext   │   useAuth      │  │
│  │  │   & Firebase          │   & Firebase   │   hook         │  │
│  │  │   auth                │   auth         │                │  │
│  │  │                       │                │                │  │
│  │  │ 1. registerUser()    │ 1. loginUser() │ Access token:  │  │
│  │  │ 2. saveUserData()    │ 2. userData()  │ currentUser    │  │
│  │  │ 3. Navigate          │ 3. Navigate    │ userToken      │  │
│  │  └───────────────────────┴────────────────┴────────────────┘  │
│  │                           │                                 │  │
│  │                           ▼                                 │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │  API Calls (axiosInstance.js)                        │ │  │
│  │  │  ┌──────────────────────────────────────────────────┐ │ │  │
│  │  │  │ Request Interceptor:                           │ │ │  │
│  │  │  │ - Gets token from localStorage                │ │ │  │
│  │  │  │ - Adds: Authorization: Bearer {token}        │ │ │  │
│  │  │  └──────────────────────────────────────────────────┘ │ │  │
│  │  │                                                      │ │  │
│  │  │  ┌──────────────────────────────────────────────────┐ │ │  │
│  │  │  │ Response Interceptor:                          │ │ │  │
│  │  │  │ - If 401: Clear token & logout               │ │ │  │
│  │  │  │ - If error: Show error message               │ │ │  │
│  │  │  └──────────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                           │                                 │  │
│  │                           ▼ HTTP Request                    │  │
│  │              Authorization: Bearer {idToken}               │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ HTTP                                │
│                            │ Request/Response                    │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              BACKEND (Node.js/Express)                      │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Express Server (server.js)                         │  │  │
│  │  │  - initializeFirebaseAdmin()                        │  │  │
│  │  │  - CORS enabled                                     │  │  │
│  │  │  - JSON parser middleware                          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                           │                                │  │
│  │                           ▼                                │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Routes                                             │  │  │
│  │  │  GET  /health             [PUBLIC]                 │  │  │
│  │  │  POST /api/appointments   [PROTECTED]              │  │  │
│  │  │  GET  /api/appointments   [PROTECTED]              │  │  │
│  │  │  POST /api/patients       [PROTECTED]              │  │  │
│  │  │  GET  /api/scan-orders    [PROTECTED]              │  │  │
│  │  │  GET  /api/reports        [PROTECTED]              │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                           │                                │  │
│  │              For /api routes: ▼                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Firebase Auth Middleware                           │  │  │
│  │  │  (middleware/firebaseAuth.js)                       │  │  │
│  │  │                                                      │  │  │
│  │  │  1. Extract "Bearer {token}" from header           │  │  │
│  │  │  2. Verify token with Firebase Admin SDK           │  │  │
│  │  │  3. If valid:                                       │  │  │
│  │  │     - Attach req.user = {uid, email, ...}         │  │  │
│  │  │     - Continue to route handler                    │  │  │
│  │  │  4. If invalid/expired:                            │  │  │
│  │  │     - Return 401/403 error                         │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                           │                                │  │
│  │        Protected ──────────┴──────────► Route Handler      │  │
│  │        (with req.user)                 (queries DB, etc)   │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ HTTP Response                       │
│                            │ + Data/Error                        │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              BACKEND - Connected Services                   │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Database   │  │   Firebase   │  │ Other APIs   │    │  │
│  │  │ (MongoDB,    │  │   Services   │  │ (if needed)  │    │  │
│  │  │  PostgreSQL) │  │              │  │              │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────┐
│               FIREBASE SERVICES (Google Cloud)                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐    ┌──────────────────────┐            │
│  │  Authentication      │    │  Firestore Database  │            │
│  │  - Email/Password    │    │  Collections:        │            │
│  │  - Token signing     │    │  - users/{uid}       │            │
│  │  - Token validation  │    │  - patients          │            │
│  │  - User management   │    │  - appointments      │            │
│  │                      │    │  - reports           │            │
│  └──────────────────────┘    │  - scan-orders       │            │
│             │                └──────────────────────┘            │
│             │ Used by:               │ Used by:                  │
│             ├─ Frontend              ├─ Frontend                 │
│             │ (registerUser)         │ (saveUserData)            │
│             │ (loginUser)            │ (getUserData)             │
│             │                        │                           │
│             └─ Backend               └─ Backend                  │
│               (Admin SDK)              (Controllers)             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Registration Flow
```
User Form
   │
   ├─ Input: firstName, lastName, email, phone, password, confirmPassword
   │
   ▼
RegisterPage.handleSubmit()
   │
   ├─ Validate form (email regex, password length, etc)
   │
   ▼
registerUser(email, password)  [Firebase]
   │
   ├─ Firebase.createUserWithEmailAndPassword()
   │
   ├─ If success:
   │  └─ Returns: {user: {uid, email}, token: idToken}
   │
   ├─ If error:
   │  └─ Returns: {success: false, error: message, code: errorCode}
   │
   ▼
saveUserData(uid, {firstName, lastName, email, phone, role})  [Firestore]
   │
   ├─ Save to Firestore: users/{uid}
   │
   ├─ If success: Continue
   │
   ├─ If error: Return error
   │
   ▼
Save to localStorage:
   ├─ authToken = idToken
   ├─ userRole = "patient"
   ├─ userName = fullName
   ├─ userEmail = email
   │
   ▼
onLogin() callback
   │
   ▼
Navigate to "booking" page
   │
   ▼
AuthContext detects login → Redirects automatically
```

### Login Flow
```
User Form
   │
   ├─ Input: email, password
   │
   ▼
LoginPage.handleSubmit()
   │
   ├─ Validate form
   │
   ├─ Only allow Firebase login for email method
   │ (Phone/Patient ID show "not implemented")
   │
   ▼
loginUser(email, password)  [Firebase]
   │
   ├─ Firebase.signInWithEmailAndPassword()
   │
   ├─ If success:
   │  ├─ Get idToken
   │  └─ Returns: {user: {uid, email}, token: idToken}
   │
   ├─ If error:
   │  ├─ "auth/user-not-found" → Show under email field
   │  ├─ "auth/wrong-password" → Show under password field
   │  ├─ "auth/too-many-requests" → Show alert
   │  └─ Returns: {success: false, error: message}
   │
   ▼
getUserData(uid)  [Firestore]
   │
   ├─ Get user document from Firestore
   │
   ├─ Extract: firstName, lastName, etc
   │
   ▼
Save to localStorage:
   ├─ authToken = idToken
   ├─ userRole = "patient"
   ├─ userName = fullName
   ├─ userEmail = email
   ├─ userId = uid
   │
   ▼
onLogin() callback
   │
   ▼
Navigate to "results" page
   │
   ▼
AuthContext detects login → Subscribed components update
```

### API Call Flow
```
Component calls:
   axiosInstance.get("/api/appointments")
   │
   ▼
Request Interceptor:
   ├─ Get token from localStorage
   │
   ├─ If token exists:
   │  ├─ Add header: Authorization: Bearer {token}
   │
   ▼
Send HTTP request to Backend:
   ├─ GET /api/appointments
   ├─ Headers: Authorization: Bearer eyJ...
   │
   ▼
Backend receives request
   │
   ▼
firebaseAuthMiddleware:
   │
   ├─ Extract token from header
   │
   ├─ If no header:
   │  └─ Return 401: "Missing or malformed authorization token"
   │
   ├─ Verify token with Firebase Admin SDK:
   │  ├─ admin.auth().verifyIdToken(token)
   │
   ├─ If valid:
   │  ├─ Extract uid, email from token
   │  ├─ Set req.user = {uid, email, ...}
   │  ├─ Call next() → Continue to route handler
   │
   ├─ If expired:
   │  └─ Return 401: "Token has expired"
   │
   ├─ If invalid:
   │  └─ Return 403: "Authentication failed"
   │
   ▼
Route Handler:
   ├─ Access req.user.uid
   ├─ Query database with user context
   ├─ Return data
   │
   ▼
Backend sends response
   │
   ▼
Response Interceptor:
   │
   ├─ If 401 error:
   │  ├─ Clear localStorage
   │  ├─ Clear auth state
   │  ├─ Optional: Redirect to login
   │
   ├─ Show any error messages
   │
   ▼
Component receives data or error
```

### Logout Flow
```
User clicks logout button
   │
   ▼
logout()  [from AuthContext]
   │
   ▼
logoutUser()  [Firebase]
   │
   ├─ Firebase.signOut()
   │
   ├─ Clear localStorage: authToken
   │
   ▼
AuthContext detects logout
   │
   ├─ onAuthStateChanged fires
   │
   ├─ currentUser = null
   │
   ▼
All components using context update
   │
   ▼
App redirects to login page
```

---

## Token Lifecycle

```
Registration/Login
   │
   ├─ Firebase creates: idToken (valid for ~1 hour)
   │
   ├─ Also creates: refreshToken (long-lived)
   │
   ▼
Save to localStorage:
   ├─ authToken = idToken
   │
   ▼
Use in API calls:
   ├─ Every request includes: Authorization: Bearer {idToken}
   │
   ├─ Backend verifies token with Firebase Admin SDK
   │
   ▼
Token Expiration (~1 hour):
   │
   ├─ Firebase automatically refreshes using refreshToken
   │
   ├─ onAuthStateChanged fires with new idToken
   │
   ├─ localStorage updated with new token
   │
   ▼
Next API call uses new token
   │
   ▼
User stays logged in seamlessly
```

---

## Error Handling Paths

```
Registration Errors:
├─ Email already in use
│  └─ Display under email field: "This email is already registered"
│
├─ Weak password
│  └─ Display under password field: "Password must be at least 6 characters"
│
├─ Invalid email
│  └─ Display under email field: "Invalid email address"
│
└─ Other errors
   └─ Display alert: Error message


Login Errors:
├─ User not found
│  └─ Display under email field: "No account found with this email"
│
├─ Wrong password
│  └─ Display under password field: "Incorrect password"
│
├─ Too many requests
│  └─ Display alert: "Too many login attempts. Try again later."
│
├─ Invalid email
│  └─ Display under email field: "Invalid email address"
│
└─ Other errors
   └─ Display alert: Error message


API Errors:
├─ 401 Unauthorized
│  ├─ Clear localStorage
│  ├─ Redirect to login
│  └─ Show: "Please log in again"
│
├─ 403 Forbidden
│  ├─ Token exists but invalid
│  └─ Show: "Authentication failed"
│
├─ 500 Server Error
│  └─ Show: "Server error occurred"
│
└─ Network Error
   └─ Show: "Connection failed"
```

---

## Data Storage Locations

```
Frontend Storage:
├─ localStorage
│  ├─ authToken (Firebase idToken)
│  ├─ userRole ("patient")
│  ├─ userName (full name)
│  ├─ userEmail (email)
│  └─ userId (Firebase UID)
│
├─ React State (AuthContext)
│  ├─ currentUser (logged in user object)
│  ├─ userToken (idToken for components)
│  └─ loading (auth checking)
│
└─ Firestore (Firebase Backend)
   ├─ users/{uid}
   │  ├─ firstName
   │  ├─ lastName
   │  ├─ email
   │  ├─ phone
   │  ├─ role
   │  ├─ createdAt
   │  └─ updatedAt
   │
   ├─ patients/{patientId}
   │  └─ Associated with userId
   │
   ├─ appointments/{appointmentId}
   │  └─ Associated with userId
   │
   └─ reports/{reportId}
      └─ Associated with userId


Backend Storage:
├─ Environment Variables
│  ├─ FIREBASE_ADMIN_KEY (service account)
│  └─ NODE_ENV
│
├─ Request Object (req.user)
│  ├─ uid (extracted from verified token)
│  ├─ email (extracted from verified token)
│  └─ Other user claims
│
└─ Database (Application-specific)
   ├─ User profiles/records
   ├─ Appointments
   ├─ Reports
   └─ Scan orders
```

---

## Security Layers

```
Layer 1: Firebase Authentication
├─ Email/Password encrypted
├─ JWT tokens signed by Firebase
├─ Token expiration (1 hour)
└─ Automatic refresh

Layer 2: Frontend Storage
├─ tokens in localStorage (accessible)
├─ Sensitive data NOT in localStorage
└─ Tokens cleared on logout

Layer 3: API Transport
├─ HTTP/HTTPS (should use HTTPS in production)
├─ Bearer token in Authorization header
└─ CORS configured

Layer 4: Backend Verification
├─ Firebase Admin SDK validates token signature
├─ Firebase Admin SDK checks token expiration
├─ Firebase Admin SDK verifies issuer
└─ Token verification before accessing user data

Layer 5: Firestore Security Rules
├─ Users can only read their own data
├─ Admins can read all user data
├─ Write operations limited by rules
└─ Rules enforced at database level
```

---

## Scalability & Performance

```
Current Architecture:
├─ Frontend: Static built assets (Vite)
├─ Backend: Node.js/Express (single instance)
├─ Authentication: Firebase (serverless, auto-scaling)
├─ Database: Firestore (serverless, auto-scaling)
└─ Storage: Firebase (CDN, auto-scaling)


Scaling Improvements:
├─ Token caching (already done - onAuthStateChanged)
├─ API request batching (implement via React Query)
├─ Database indexing (configure in Firestore)
├─ Backend horizontal scaling (add load balancer)
├─ CDN for frontend assets (use Firebase Hosting)
└─ Background jobs (Cloud Functions if needed)
```
