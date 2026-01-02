/**
 * CORE DATA MODELS
 *
 * These interfaces define the complete data structure for the university data engine.
 * Each field must store source tracking information for auditability.
 */
/**
 * Program level enumeration
 */
export var ProgramLevel;
(function (ProgramLevel) {
    ProgramLevel["UG"] = "Undergraduate";
    ProgramLevel["PG"] = "Postgraduate";
    ProgramLevel["PHD"] = "PhD";
})(ProgramLevel || (ProgramLevel = {}));
/**
 * Intake/term enumeration
 */
export var IntakeTerm;
(function (IntakeTerm) {
    IntakeTerm["FALL"] = "Fall";
    IntakeTerm["SPRING"] = "Spring";
    IntakeTerm["SUMMER"] = "Summer";
    IntakeTerm["WINTER"] = "Winter";
})(IntakeTerm || (IntakeTerm = {}));
/**
 * Job lifecycle states
 * Jobs progress through these states in sequence
 */
export var JobStatus;
(function (JobStatus) {
    JobStatus["QUEUED"] = "QUEUED";
    JobStatus["FETCHING"] = "FETCHING";
    JobStatus["PARSING"] = "PARSING";
    JobStatus["VALIDATING"] = "VALIDATING";
    JobStatus["DIFFING"] = "DIFFING";
    JobStatus["AI_VERIFYING"] = "AI_VERIFYING";
    JobStatus["READY_TO_PUBLISH"] = "READY_TO_PUBLISH";
    JobStatus["PUBLISHED"] = "PUBLISHED";
    JobStatus["FAILED"] = "FAILED";
    JobStatus["FAILED_BLOCKED"] = "FAILED_BLOCKED"; // Rate limited or blocked, requires manual review
})(JobStatus || (JobStatus = {}));
//# sourceMappingURL=core.js.map