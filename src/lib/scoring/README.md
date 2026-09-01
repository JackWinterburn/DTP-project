# Scoring engine (Phase 3, critical feature)

`ScoringEngine.score(answers)` reads the versioned question/course-weighting
config in `src/config/` and produces a `Result` of ranked `CourseMatch`
objects, each with visible reasons. See Section 3.3 (UML class diagram) and
Section 4.2 of the technical report. Single-responsibility: this module never
fetches data, persists results, or calls the AI API.
