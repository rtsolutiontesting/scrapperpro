# Architecture Deep Dive

## System Design Philosophy

This system is built with **production-grade principles** for a B2B education platform where data accuracy and reliability are critical.

### Core Principles

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Fail-Safe Defaults**: System fails conservatively (blocks rather than proceeds with uncertainty)
3. **Auditability**: Every data point tracks its source and verification method
4. **Manual Review**: Critical changes require human approval
5. **Respectful Operation**: All external requests follow ethical scraping practices

## Data Flow

### Complete Pipeline

```
User Action (Frontend)
    ↓
API Request → Backend API
    ↓
Job Created → Job Queue
    ↓
Job Manager → Fetcher Layer
    ↓ [FetchResult: {url, body, statusCode, ...}]
Parser Layer
    ↓ [Program[]: structured data]
Validator Layer
    ↓ [Program[]: validated data]
Diff Engine
    ↓ [ProgramDiff[]: change detection]
AI Verifier (optional)
    ↓ [Program[]: verified data]
Job Status: READY_TO_PUBLISH
    ↓
User Approval (Frontend)
    ↓
Publisher Layer → Firestore
    ↓
Job Status: PUBLISHED
```

### State Transitions

```
QUEUED
  → FETCHING (on execution start)
    → PARSING (after fetch complete)
      → VALIDATING (after parse complete)
        → DIFFING (after validation complete)
          → AI_VERIFYING (if enabled)
            → READY_TO_PUBLISH (if no errors)
              → PUBLISHED (after approval)
              
Any state → FAILED (on error)
FETCHING → FAILED_BLOCKED (on 403/429)
```

## Layer Details

### Fetcher Layer

**File**: `backend/layers/fetcher.ts`

**Responsibilities**:
- HTTP fetching only (no headless browsers)
- Respectful headers (human-like User-Agent rotation)
- Sequential execution (one URL at a time)
- Delay management (configurable, with jitter)
- Error handling (backoff, blocking detection)

**Key Methods**:
- `fetchUrl(url, retryCount)`: Fetch single URL with retry logic
- `fetchUrls(urls[])`: Sequential fetch with delays

**Error Handling**:
- 403/429 → `FAILED_BLOCKED` (no retry)
- 5xx → Retry with backoff
- Network errors → Retry with backoff
- Timeouts → Retry with backoff

### Parser Layer

**File**: `backend/layers/parser.ts`

**Responsibilities**:
- Extract structured data from HTML
- NEVER guess or hallucinate values
- Return `null` for missing fields
- Preserve source metadata

**Key Principles**:
- If field not found → `null`
- If value ambiguous → `null` (conservative)
- Always attach source metadata to fields

**Current Implementation**:
- Basic regex-based extraction (placeholder)
- In production: Use proper HTML parsers (cheerio, jsdom)
- University-specific parsers recommended

### Validator Layer

**File**: `backend/layers/validator.ts`

**Responsibilities**:
- Format validation (dates, currency, scores)
- Cross-field consistency checks
- Data type validation

**Validation Rules**:
- Dates: Valid format, not too far in past/future
- Currency: Contains digits, reasonable length
- IELTS: 0-9 range
- TOEFL: 0-120 range
- Cross-field: IELTS/TOEFL correlation, fee relationships

**Output**:
- `valid`: Programs that passed validation
- `invalid`: Programs with errors (with error details)

### Diff Engine

**File**: `backend/layers/diff-engine.ts`

**Responsibilities**:
- Compare previous vs current data
- Detect field-level changes
- Calculate confidence scores
- Flag changes requiring review

**Change Types**:
- `unchanged`: Value and source same
- `changed`: Value different
- `missing`: Field removed
- `newly_added`: New field

**Review Flags**:
- Low confidence (< threshold)
- Significant changes (>20% for financial fields)
- Any deadline changes
- Score changes

### AI Verification Layer

**File**: `backend/layers/ai-verifier.ts`

**Responsibilities**:
- Secondary verification only
- Verify ambiguous/low-confidence fields
- Update confidence scores
- Flag fields needing manual review

**AI Usage Constraints**:
- NEVER generates new data
- ONLY verifies existing data
- ONLY verifies when confidence < threshold
- Updates confidence scores
- Flags for manual review if still uncertain

**Current Status**:
- Structure implemented
- Mock verification (needs real API integration)

### Publisher Layer

**File**: `backend/layers/publisher.ts`

**Responsibilities**:
- Batch writes to Firestore
- Version history management
- Audit logging
- Metadata updates

**Features**:
- Batch writes (500 operations per batch)
- Version tracking (increment version number)
- Audit logs (who, when, what)
- Source preservation

**Collections**:
- `university_programs`: Published programs
- `program_versions`: Version history
- `audit_logs`: Action logs

## Job Management

### Job Queue

**File**: `backend/job/job-queue.ts`

**Responsibilities**:
- Sequential job execution (one university at a time)
- Queue management
- Status tracking

**Execution**:
- Processes queue sequentially
- Waits between universities (configurable delay)
- Continues on failure (logs but doesn't stop queue)

### Job Manager

**File**: `backend/job/job-manager.ts`

**Responsibilities**:
- Orchestrate complete pipeline
- State machine management
- Error handling
- Approval workflow

**Methods**:
- `createJob()`: Create new job
- `executeJob()`: Run complete pipeline
- `approveAndPublish()`: Manual approval

## Frontend Architecture

### Components

- **JobDashboard**: List of jobs with status
- **DiffViewer**: Field-by-field change visualization
- **Layout**: Common layout wrapper

### Services

- **api.ts**: HTTP client for backend API
- **jobService.ts**: Job management service with Firestore subscriptions

### Data Flow

```
Firestore (fetch_jobs collection)
    ↓ (real-time subscription)
Frontend State
    ↓ (user actions)
API Calls → Backend
    ↓ (updates)
Firestore
    ↓ (real-time subscription)
Frontend State (updated)
```

## Configuration

### Environment Variables

**Backend** (`backend/.env`):
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `DELAY_BETWEEN_REQUESTS`: Milliseconds between requests
- `DELAY_BETWEEN_UNIVERSITIES`: Milliseconds between universities
- `MAX_RETRIES`: Maximum retry attempts
- `GEMINI_API_KEY`: AI API key (optional)
- `AI_ENABLED`: Enable AI verification
- `LOG_LEVEL`: Logging level

**Frontend** (`.env.local`):
- `VITE_API_URL`: Backend API URL

### Default Values

Conservative defaults ensure safe operation:

- Delay between requests: 7500ms (7.5 seconds)
- Delay between universities: 10000ms (10 seconds)
- Max retries: 3
- Backoff multiplier: 2.0
- Fetch timeout: 30000ms (30 seconds)

## Error Handling

### Error Classification

1. **BLOCKED** (403/429):
   - Status: `FAILED_BLOCKED`
   - Action: No retry, manual review required

2. **RETRYABLE** (5xx, network, timeout):
   - Status: `FAILED`
   - Action: Retry with exponential backoff

3. **FATAL** (invalid data, parse errors):
   - Status: `FAILED`
   - Action: Log error, continue with other jobs

### Retry Strategy

```
Attempt 1: Immediate
Attempt 2: Delay = baseDelay * multiplier^1
Attempt 3: Delay = baseDelay * multiplier^2
...
Max attempts: MAX_RETRIES (default: 3)
```

## Security Considerations

### Firestore Rules

Recommended rules (adjust for your needs):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Read access for authenticated users
    match /fetch_jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend writes
    }
    
    // Programs: read for all, write only backend
    match /university_programs/{programId} {
      allow read: if true;
      allow write: if false; // Only backend writes
    }
    
    // Audit logs: read for admins only
    match /audit_logs/{logId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if false; // Only backend writes
    }
  }
}
```

### API Security

- Backend API should require authentication
- Use Firebase Authentication for frontend
- Validate all inputs
- Rate limit API endpoints

## Monitoring & Observability

### Logging

Structured JSON logs with context:

```json
{
  "timestamp": "ISO 8601",
  "level": "info|warn|error|critical",
  "message": "Human-readable message",
  "context": {
    "jobId": "...",
    "duration": 12345,
    "url": "...",
    ...
  }
}
```

### Metrics to Track

- Job completion rate
- Average job duration
- Parse success rate
- Validation failure rate
- Blocked request rate
- AI verification usage
- Manual review rate
- Publication rate

### Alerts

Set up alerts for:
- High failure rate (>10%)
- Blocked requests (immediate alert)
- Long-running jobs (>10 minutes)
- Low confidence scores
- Manual review backlog

## Future Enhancements

1. **Parser Improvements**:
   - Use proper HTML parsers (cheerio, jsdom)
   - University-specific parsers
   - PDF parsing support
   - Machine learning for extraction

2. **AI Integration**:
   - Complete Gemini API integration
   - Prompt engineering for verification
   - Confidence score refinement

3. **URL Management**:
   - Database of verified URLs
   - URL discovery automation
   - URL health checking

4. **Performance**:
   - Caching layer
   - Parallel processing (with rate limits)
   - Incremental updates

5. **UI Enhancements**:
   - Better diff visualization
   - Bulk approval
   - Filtering and search
   - Export functionality

---

This architecture is designed for **long-term operation** with **daily execution** in mind. All design decisions prioritize **safety**, **reliability**, and **auditability**.

