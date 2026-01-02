# University Data Ingestion & Verification Engine

**Production-grade university admission data ingestion and verification system for B2B education platforms.**

## 🎯 System Overview

This system fetches, validates, normalizes, and compares university admission-related data with a focus on Indian applicant requirements. It follows strict architectural principles to ensure data quality, safety, and compliance.

### Core Philosophy

- **Never hallucinate data** - Missing data is represented as `null`, never guessed
- **Silence is better than wrong data** - If data can't be verified, it's not published
- **AI is an assistant, not an authority** - AI is used for verification only, not as primary source
- **Deterministic code > AI guesses** - Parsers are deterministic, AI verifies ambiguity
- **Conservative and respectful** - All scraping is done with respectful delays and headers

## 🏗️ Architecture

The system is built with clear separation of concerns across multiple layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Control Panel)                  │
│  - Job Dashboard                                            │
│  - Diff Viewer                                              │
│  - Manual Approve/Reject                                    │
│  - Real-time status updates                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP API
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKEND API                               │
│  - Firebase Functions / Cloud Run                            │
│  - Job Queue Management                                     │
│  - API endpoints                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              JOB LIFECYCLE MANAGER                           │
│  Orchestrates the complete pipeline                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│   FETCHER    │ │   PARSER   │ │ VALIDATOR  │
│              │ │            │ │            │
│ - HTTP fetch │ │ - Extract  │ │ - Format   │
│ - Headers    │ │ - No guess │ │ - Dates    │
│ - Delays     │ │ - Null if  │ │ - Cross-   │
│ - Backoff    │ │   missing  │ │   field    │
└──────┬───────┘ └─────┬──────┘ └─────┬──────┘
       │               │              │
       └───────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │   DIFF ENGINE   │
              │                 │
              │ - Compare       │
              │ - Field diffs   │
              │ - Confidence    │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  AI VERIFIER    │
              │                 │
              │ - Secondary     │
              │ - Confidence    │
              │ - Flag review   │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │   PUBLISHER     │
              │                 │
              │ - Batch writes  │
              │ - Version hist  │
              │ - Audit logs    │
              └─────────────────┘
```

### Layer Responsibilities

#### 1. Fetcher Layer
- **Purpose**: Fetch raw data from university websites
- **Methods**: `fetch()` API only (no headless browsers)
- **Features**:
  - Respectful headers (human-like User-Agent)
  - Sequential execution (one page at a time)
  - Configurable delays (5-10 seconds default)
  - Automatic backoff on errors
  - Blocks on 403/429 (no retry)

#### 2. Parser Layer
- **Purpose**: Extract structured fields from HTML/PDF
- **Principles**:
  - If field not found → return `null`
  - Never guess or hallucinate values
  - Preserve source metadata for every field
- **Output**: Structured `Program` objects with optional fields

#### 3. Validator Layer
- **Purpose**: Ensure data format correctness
- **Checks**:
  - Date sanity (future dates, valid formats)
  - Format validation (currency, scores, percentages)
  - Cross-field consistency (IELTS/TOEFL correlation, fee relationships)
- **Output**: Valid/invalid programs with error details

#### 4. Diff Engine
- **Purpose**: Compare previous vs new data
- **Features**:
  - Field-by-field comparison
  - Change detection (unchanged, changed, missing, newly added)
  - Confidence scoring
  - Flags changes requiring review
- **Output**: `ProgramDiff` objects with change details

#### 5. AI Verification Layer
- **Purpose**: Secondary verification of ambiguous data
- **Constraints**:
  - AI is used ONLY for verification, not generation
  - Only verifies low-confidence or conflicting fields
  - Updates confidence scores
  - Flags fields needing manual review
- **Output**: Verified programs with updated confidence scores

#### 6. Publisher Layer
- **Purpose**: Write verified data to Firestore
- **Features**:
  - Batch writes (efficient)
  - Version history (track changes over time)
  - Audit logs (who approved, when)
  - Only publishes after manual approval (by default)
- **Output**: Published programs in Firestore

## 🔄 Job Lifecycle

Every data fetch follows this state machine:

```
QUEUED → FETCHING → PARSING → VALIDATING → DIFFING → AI_VERIFYING → READY_TO_PUBLISH → PUBLISHED
                                                                                            ↓
                                                                                        FAILED
                                                                                            ↓
                                                                                    FAILED_BLOCKED
```

### State Descriptions

- **QUEUED**: Job created, waiting in queue
- **FETCHING**: Downloading data from URLs
- **PARSING**: Extracting structured fields
- **VALIDATING**: Checking format and consistency
- **DIFFING**: Comparing with previous data
- **AI_VERIFYING**: AI verification (if enabled)
- **READY_TO_PUBLISH**: Waiting for manual approval
- **PUBLISHED**: Approved and written to Firestore
- **FAILED**: Error occurred (retryable)
- **FAILED_BLOCKED**: Rate limited/blocked (requires manual review)

## 🔒 Safety & Compliance

### Hard Constraints

**DO NOT use any method that:**
- Blocks URLs or triggers bot protection
- Violates robots.txt
- Causes IP bans
- Risks domain suspension

**ONLY ALLOWED methods:**
- Public university webpages (HTML fetch)
- Public PDFs
- Public APIs (if available)
- Official university portals with public access

**ABSOLUTELY FORBIDDEN:**
- Headless browsers (Puppeteer, Playwright)
- Aggressive crawling
- Parallel hammering
- Cloudflare bypass tricks
- CAPTCHA solving
- Proxy rotation

### Rate Limiting

- **Default delay**: 7.5 seconds between requests
- **Between universities**: 10 seconds
- **Automatic backoff**: Exponential backoff on retries
- **Blocked requests**: Marked as `FAILED_BLOCKED`, no automatic retry

### Configuration

All rate limiting is configurable via environment variables (see `backend/.env.example`):

```bash
DELAY_BETWEEN_REQUESTS=7500      # ms
DELAY_BETWEEN_UNIVERSITIES=10000 # ms
MAX_RETRIES=3
BACKOFF_MULTIPLIER=2.0
```

## 📊 Data Model

### Core Types

All data is strongly typed with TypeScript interfaces:

- **University**: Basic university information
- **Program**: Complete program data with source tracking
- **Intake**: Term/year information with deadlines
- **Deadline**: Individual deadline with source metadata
- **FetchJob**: Job lifecycle tracking
- **ProgramDiff**: Field-by-field change detection
- **ConfidenceScore**: Confidence breakdown
- **AuditLog**: Action tracking

### Source Tracking

Every field stores:
- **value**: The actual data
- **source**: Source metadata including:
  - `sourceUrl`: URL where data was found
  - `fetchedAt`: Timestamp
  - `confidenceScore`: 0-100 confidence
  - `verificationMethod`: `direct` | `inferred` | `ai_verified`

This enables full traceability and auditability.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Gemini API key (for AI verification, optional)

### Installation

1. **Install frontend dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Firebase**:
   - Update `firebase.ts` with your Firebase config
   - Set up Firestore collections:
     - `fetch_jobs`
     - `university_programs`
     - `program_versions`
     - `audit_logs`
     - `diff_results`

4. **Configure environment**:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your configuration

### Running Locally

1. **Start backend** (Firebase Functions emulator or Cloud Run):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend**:
   ```bash
   npm run dev
   ```

3. **Access frontend**: http://localhost:3000

### Deployment

#### Firebase Functions

```bash
cd backend
npm run build
firebase deploy --only functions
```

#### Cloud Run

```bash
cd backend
npm run build
gcloud run deploy
```

## 📝 Usage

### Creating a Job

1. Use the frontend UI to create a new job
2. Or call the API directly:

```bash
POST /jobs/create
{
  "universityName": "University of Toronto",
  "country": "Canada",
  "urls": ["https://www.utoronto.ca/admissions"],
  "autoPublish": false,
  "createdBy": "user"
}
```

### Manual Approval

1. Jobs reach `READY_TO_PUBLISH` state
2. Review diffs in the frontend
3. Approve or reject changes
4. Only approved data is published to Firestore

### Monitoring

- Job status is visible in real-time via Firestore subscriptions
- All actions are logged in audit logs
- Failed jobs are marked and require review

## 🔍 Observability

### Structured Logging

All operations log structured JSON:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "message": "Job execution complete",
  "context": {
    "jobId": "job_123",
    "status": "READY_TO_PUBLISH",
    "duration": 45000,
    "programsFound": 5
  }
}
```

### Log Levels

- **debug**: Detailed debugging information
- **info**: General information
- **warn**: Warning messages
- **error**: Error conditions
- **critical**: Critical failures

### Metrics to Monitor

- Fetch duration
- Parse success rate
- Validation failure rate
- AI verification disagreements
- Change frequency per university
- Blocked request rate

## 🛠️ Development

### Project Structure

```
.
├── backend/
│   ├── layers/          # Core processing layers
│   │   ├── fetcher.ts
│   │   ├── parser.ts
│   │   ├── validator.ts
│   │   ├── diff-engine.ts
│   │   ├── ai-verifier.ts
│   │   └── publisher.ts
│   ├── job/             # Job management
│   │   ├── job-manager.ts
│   │   └── job-queue.ts
│   ├── utils/           # Utilities
│   │   ├── logger.ts
│   │   └── delay.ts
│   ├── config.ts        # Configuration
│   └── index.ts         # Entry point
├── components/          # React components
│   ├── JobDashboard.tsx
│   ├── DiffViewer.tsx
│   └── Layout.tsx
├── services/            # Frontend services
│   ├── api.ts
│   └── jobService.ts
├── types/               # TypeScript types
│   └── core.ts
└── utils/               # Frontend utilities
    └── universityUrls.ts
```

### Adding a New Parser

1. Create a parser class in `backend/layers/parser.ts`
2. Follow the principle: return `null` if data not found
3. Always preserve source metadata
4. Add validation rules if needed

### Extending Data Model

1. Update `types/core.ts` with new interfaces
2. Update parser to extract new fields
3. Update validator to validate new fields
4. Update diff engine to compare new fields
5. Update frontend to display new fields

## ⚠️ Important Notes

### Production Considerations

1. **URL Management**: Maintain a database of verified URLs per university
2. **Parser Sophistication**: Current parsers are basic - enhance with proper HTML parsing libraries (cheerio, jsdom)
3. **AI Integration**: Complete the AI verification implementation with actual Gemini API calls
4. **Firestore Rules**: Set up proper security rules for Firestore
5. **Error Handling**: Enhance error handling for production edge cases
6. **Monitoring**: Set up Cloud Logging and monitoring alerts
7. **Backup**: Implement backup strategies for Firestore data

### Known Limitations

- Parser uses basic regex - needs enhancement
- AI verification is mocked - needs real API integration
- URL discovery is basic - needs proper domain mapping
- Frontend diff viewer needs Firestore integration

## 📄 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

---

**Built with production-grade principles. Designed for trust and reliability.**
