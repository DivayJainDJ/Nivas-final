# NivasAI - System Architecture & API Documentation

This document provides a comprehensive overview of the **NivasAI** application architecture. It explains the connections between the three primary systems: the **Frontend**, the **Backend for Frontend (BFF)**, and the **AI Microservices**.

---

## 1. System Architecture & Connections

NivasAI is built on a modern, decoupled microservices architecture. The system consists of three main tiers:

### **A. Frontend (React/Vite)**
The user-facing client application. It handles UI rendering, user interactions, and authenticates users via Firebase Auth.
- **Connection:** Instead of calling Google AI, Maps, or Document AI APIs directly (which exposes secret keys), the frontend sends all its requests securely to the **Backend BFF** using the `VITE_API_BASE_URL`.
- **Primary Routes:**
  - `/dashboard`: Citizen overview.
  - `/housing-match`: Housing eligibility and matching.
  - `/slum-planner`: Admin/Officer ward analysis.
  - `/complaints`: Issue reporting and tracking.

### **B. Backend for Frontend (nivas-bff) (Express/Node.js)**
Acts as the secure gateway and orchestration layer between the client and the complex AI microservices.
- **Connection to Frontend:** Validates Firebase ID tokens, performs access control (Admin vs. Officer vs. Citizen), and handles basic CRUD operations directly via Firestore.
- **Connection to AI Services:** When a request requires heavy computation or AI logic (e.g., parsing a document, matching housing, analyzing a ward), the BFF forwards the request to the **AI Services** via the `NIVASAI_SERVICES_BASE_URL`.

### **C. AI Services (FastAPI/Python)**
A specialized suite of Python microservices designed to handle all AI processing, document parsing, scheduling, and external webhooks (like WhatsApp/Twilio).
- **Connection:** Invoked internally by the BFF. It interacts with external APIs (Google Gemini, Document AI, Google Maps) and writes the processed intelligence back into **Firestore**. It also listens for external events (e.g., WhatsApp Webhooks) independently.

---

## 2. API Endpoints Breakdown

### 🟢 Backend BFF Endpoints (`nivas-bff`)
*Base URL: `http://localhost:4000/api`*

These endpoints are consumed directly by the Frontend. All routes (except health) require Firebase Authentication headers.

**Health & User:**
- `GET /health` - Returns BFF operational status.
- `GET /me` - Get current authenticated user profile.

**Complaints:**
- `GET /complaints` - List complaints (filtered by user role).
- `GET /complaints/:complaintId` - Get specific complaint details.
- `POST /complaints` - Create a new civic complaint.
- `PATCH /complaints/:complaintId/status` - Update complaint status.
- `POST /complaints/:complaintId/route` - Manually route a complaint to an officer.

**Wards & Planning:**
- `GET /wards` - List all wards (Admin/Officer).
- `GET /wards/:wardId` - Get details of a specific ward.
- `POST /wards/:wardId/analyze` - Trigger an AI infrastructure analysis for a ward.

**Housing:**
- `GET /housing/profile` - Get user's family housing profile.
- `POST /housing/profile` - Create/Update family profile.
- `POST /housing/matches` - Trigger the AI engine to find eligible housing units based on profile.
- `GET /housing/applications` - List user's housing applications.
- `POST /housing/applications` - Submit a new housing application.

**Documents:**
- `POST /documents/upload-complete` - Register a newly uploaded document in the database.
- `POST /documents/:documentId/parse` - Trigger AI OCR and data extraction on a document.
- `GET /documents/:documentId` - Fetch the verification and parsed status of a document.

**Notifications:**
- `POST /notifications/register` - Register a device push token for notifications.

---

### 🔵 AI Service Endpoints (`ai-services`)
*Base URL: Configured via `NIVASAI_SERVICES_BASE_URL`*

These endpoints are primarily consumed by the BFF or external Webhooks. They handle the heavy lifting.

**Analytics & Dashboards:**
- `GET /analytics/summary` - Aggregated system analytics.
- `GET /analytics/ward/{ward_id}` - Analytics specific to a ward.
- `GET /analytics/anomalies` - Detects anomalies in civic data.
- `GET /analytics/scheduler/status` - Check the background aggregation scheduler.
- `POST /analytics/run-now` - Force run the analytics aggregation.

**Ward Analysis:**
- `POST /api/ward/analyze` (Alias: `/analyzeWard`) - Uses Gemini Vision and Google Maps to score road, water, and sanitation infrastructure from satellite imagery.

**Housing Matcher:**
- `POST /api/housing/match` (Alias: `/matchHousing`) - Evaluates a family profile against available housing schemes (like PMAY) and returns an eligibility matrix and recommendations.

**Document Parser:**
- `POST /api/documents/upload` - Receives a document, triggers Google Document AI/Vision to parse Aadhaar, PAN, Income certificates, or rent agreements, and validates fields.
- `GET /api/documents/status/{citizen_id}` - Get processing status of documents.

**Complaint Management:**
- `POST /api/complaints/create` - Creates a complaint and immediately triggers classification.
- `POST /api/router/route` - AI engine intelligently assigns a complaint to the most relevant officer based on category and load.

**Webhooks (External Connections):**
- `POST /whatsapp/webhook` - Twilio/WhatsApp webhook listener for citizens submitting complaints or checking status via chat.
- `GET /whatsapp/webhook` - Webhook verification endpoint.
- `POST /bot/webhook` - General chatbot interaction endpoint.
- `GET /bot/health` - Bot service health check.
- `POST /api/notifications/send` - Internal endpoint to broadcast push notifications.

---

## 3. Feature Connection Flow Example

**Example: A Citizen Uploads an Income Certificate**
1. **Frontend:** User selects an image and uploads it to Firebase Storage. The frontend sends a request to the BFF: `POST /api/documents/upload-complete` with the storage path.
2. **BFF (`nivas-bff`):** Validates the user, creates a `DocumentUpload` record in Firestore with `status: pending`, and responds to the frontend.
3. **Frontend:** Automatically calls `POST /api/documents/:id/parse`.
4. **BFF (`nivas-bff`):** Receives the parse request, verifies ownership, and forwards it to the AI Service: `POST /api/documents/upload`.
5. **AI Service (`ai-services`):** Downloads the image, passes it to Google Document AI, extracts `applicantName`, `income`, `issuedDate`, determines confidence, and validates the data. It returns the extracted data to the BFF.
6. **BFF (`nivas-bff`):** Updates the Firestore record with the extracted data and changes the status to `verified`. It returns the final data to the Frontend.
7. **Frontend:** Displays the extracted income details to the user and marks the document checklist as complete.
