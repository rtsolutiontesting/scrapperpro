# 📊 Where Results Appear - University Data Engine

Based on the initial requirements, here's where each result type appears in the UI:

## 🎯 Main Tabs (Top Navigation)

### 1. **QUEUE Tab** (Current: Job Dashboard)
**Location**: Main tab → "QUEUE"

**Shows**:
- ✅ List of all jobs (university data fetching jobs)
- ✅ University name and country
- ✅ Job status (QUEUED, FETCHING, PARSING, VALIDATING, DIFFING, AI_VERIFYING, READY_TO_PUBLISH, PUBLISHED, FAILED)
- ✅ Number of programs found
- ✅ URLs fetched
- ✅ Error messages (if any)
- ✅ **"Approve & Publish" button** (when status is READY_TO_PUBLISH)

**What you'll see**:
- Empty state: "No jobs in queue" (when no jobs exist)
- Job cards with status badges (color-coded)
- Click a job to select it (for viewing diffs)

---

### 2. **DIFFS Tab** (Change Diff Viewer)
**Location**: Main tab → "DIFFS"

**Should Show** (per initial requirements):
- ✅ Field-by-field comparison (old vs new values)
- ✅ Change types: unchanged, changed, missing, newly_added
- ✅ Confidence scores for each field
- ✅ Programs that require review
- ✅ Visual indicators (colors, icons)
- ✅ Overall confidence score

**Current Status**: ⚠️ Partially implemented
- Component exists (`DiffViewer.tsx`)
- UI structure is ready
- **Missing**: Connection to fetch diff data from Firestore
- Currently shows placeholder: "Diff viewer - fetch diff data from Firestore collection 'diff_results'"

**How to view diffs**:
1. Select a job from QUEUE tab
2. Click DIFFS tab
3. Should show field-by-field changes (needs backend connection)

---

### 3. **STATS Tab** (Statistics Dashboard)
**Location**: Main tab → "STATS"

**Shows**:
- ✅ Total jobs count
- ✅ Jobs by status (queued, in progress, completed, failed)
- ✅ Success/failure rates
- ✅ Processing statistics

---

## 🔄 How Results Flow

### Step 1: Create Jobs
**Where**: Excel Import feature (currently visible)
- Upload Excel file with university data
- Creates jobs for each university
- Jobs appear in QUEUE tab

### Step 2: Jobs Process (Backend)
Backend processes jobs through lifecycle:
1. QUEUED → Job created
2. FETCHING → Fetching data from URLs
3. PARSING → Extracting structured data
4. VALIDATING → Validating data format
5. DIFFING → Comparing with previous data
6. AI_VERIFYING → AI verification (if enabled)
7. READY_TO_PUBLISH → Ready for approval
8. PUBLISHED → Approved and published

### Step 3: Review Changes
**Where**: DIFFS tab
- Select a job from QUEUE
- View field-by-field changes
- See confidence scores
- Identify fields requiring review

### Step 4: Approve/Reject
**Where**: QUEUE tab
- Jobs with status READY_TO_PUBLISH show "Approve & Publish" button
- Click to approve and publish to Firestore
- Or reject to mark as failed

---

## ⚠️ Current Status & Missing Pieces

### ✅ What Works:
1. UI structure is complete
2. Job dashboard displays jobs
3. Status badges and visual indicators
4. Approve/reject buttons
5. Stats tab

### ❌ What Needs Fixing:
1. **DIFFS tab**: Needs to fetch and display diff data from Firestore
2. **Backend connection**: API needs to be running and connected
3. **Job processing**: Backend needs to process jobs through lifecycle
4. **Firestore integration**: Frontend needs to subscribe to job updates

---

## 🔧 To See Results:

1. **Create a job** (via Excel import or API)
2. **Backend processes** the job through lifecycle
3. **QUEUE tab** shows job status updates in real-time
4. **Select job** → **DIFFS tab** → View changes (needs implementation)
5. **Approve** jobs ready to publish

---

## 📍 Where to Find Each Feature:

| Feature | Location | Status |
|---------|----------|--------|
| Job Queue | QUEUE tab | ✅ Working |
| Job Status | QUEUE tab (job cards) | ✅ Working |
| Approve/Reject | QUEUE tab (button on jobs) | ✅ Working |
| Diff Viewer | DIFFS tab | ⚠️ Needs implementation |
| Statistics | STATS tab | ✅ Working |
| Excel Import | Currently visible in UI | ✅ Working |

---

**The structure is there! Results appear in the QUEUE and DIFFS tabs. The DIFFS tab needs to be connected to fetch data from Firestore.**


