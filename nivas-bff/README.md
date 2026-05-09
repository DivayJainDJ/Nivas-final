# NivasAI BFF

Backend-for-Frontend API gateway for the NivasAI MERN + microservices architecture.

## Role In The System

```text
nivasai-app      -> React frontend. Calls this BFF only.
nivasai-bff      -> Express API, Firebase auth verification, Firestore orchestration.
nivasai-services -> AI/event microservices such as complaint classification and ward analysis.
nivasai-infra    -> Firebase, GCP, hosting, and deployment configuration.
```

The frontend should not call Gemini, Document AI, Twilio, or server-side Google APIs directly. Those keys belong in this backend or in the microservices repo.

## Tech Stack

- Node.js 20
- Express
- TypeScript
- Firebase Admin Firestore
- Optional MongoDB + Mongoose for future cache/reporting needs
- Firebase Admin SDK
- Zod validation
- Axios microservice adapter

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The API defaults to:

```text
http://localhost:4000/api
```

Set this in `nivasai-app`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Authentication

Frontend requests to protected routes must include a Firebase ID token:

```http
Authorization: Bearer <firebase_id_token>
```

The BFF verifies the token with Firebase Admin and creates or updates a Mongo user record. New users default to the `resident` role.

## Environment Variables

See [.env.example](.env.example).

Required for local development:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NIVASAI_SERVICES_BASE_URL=
```

Optional:

```env
MONGO_URI=mongodb://127.0.0.1:27017/nivasai
```

Firestore is the primary database. MongoDB is not required to start the BFF.

## Firebase Collections Used

The BFF reads and writes these Firestore collections:

```text
users
complaints
familyProfiles
housingApplications
wardAnalyses
documentUploads
userTokens
```

## API Keys Needed

### Firebase Admin service account

Needed by this BFF for:

- verifying Firebase ID tokens
- reading/writing Firestore through Admin SDK
- future server-side Storage operations

Get it from:

```text
Firebase Console -> Project Settings -> Service accounts -> Generate new private key
```

Map the downloaded JSON to:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Keep `FIREBASE_PRIVATE_KEY` quoted and preserve `\n` newlines.

### Frontend Firebase web config

Needed by `nivasai-app`, not the BFF:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:4000/api
```

Get it from:

```text
Firebase Console -> Project Settings -> General -> Your apps -> Web app config
```

### Google Maps API key

Needed by backend/microservices for server-side Maps calls. A browser-restricted Maps key can still be used by frontend only for map rendering.

Get it from:

```text
Google Cloud Console -> APIs & Services -> Credentials -> Create API key
```

Enable:

```text
Maps JavaScript API
Geocoding API
Places API
Distance Matrix API
Maps Static API
```

### Gemini API key

Needed by `nivasai-services` or BFF if the BFF directly calls Gemini.

Get it from:

```text
Google AI Studio -> Get API key
```

or use Vertex AI credentials from Google Cloud if you move to enterprise deployment.

### Document AI processor

Needed for document parsing microservice.

Get it from:

```text
Google Cloud Console -> Document AI -> Processors -> Create Processor
```

Set:

```env
DOCUMENT_AI_PROJECT_ID=
DOCUMENT_AI_LOCATION=
DOCUMENT_AI_PROCESSOR_ID=
```

### Twilio WhatsApp credentials

Needed by notification/bot microservices.

Get it from:

```text
Twilio Console -> Account Info / Messaging / WhatsApp Sandbox or approved sender
```

Set:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

## API Endpoints

### Health

```http
GET /api/health
```

### Current User

```http
GET /api/me
```

### Complaints

```http
POST  /api/complaints
GET   /api/complaints
GET   /api/complaints/:complaintId
PATCH /api/complaints/:complaintId/status
POST  /api/complaints/:complaintId/route
```

### Wards

```http
GET  /api/wards
GET  /api/wards/:wardId
POST /api/wards/:wardId/analyze
```

### Housing

```http
GET  /api/housing/profile
POST /api/housing/profile
POST /api/housing/matches
GET  /api/housing/applications
POST /api/housing/applications
```

### Documents

```http
POST /api/documents/upload-complete
POST /api/documents/:documentId/parse
GET  /api/documents/:documentId
```

### Notifications

```http
POST /api/notifications/register-token
```

## Error Format

All API errors use:

```json
{
  "error": "ValidationError",
  "message": "Request validation failed",
  "code": 400,
  "details": {}
}
```

## Microservice Adapter

All calls to `nivasai-services` go through `src/services/microservicesClient.ts`.

The client currently exposes stable methods:

- `classifyComplaint`
- `routeComplaint`
- `analyzeWard`
- `matchHousing`
- `parseDocument`
- `broadcastNotification`

If `NIVASAI_SERVICES_BASE_URL` is not configured, methods return safe placeholder responses where possible. This lets frontend integration begin before every AI microservice endpoint is deployed.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```
