# Parent Summary Card generation (Phase 6, critical feature)

Server-side-only call to Gemini 2.5 Flash-Lite with a fact-locked prompt
(constants file, not free text) and output validation against the source
facts. Falls back to a static template on API error or validation failure
(NFR6). See Risk R1 (Functional Specification and Risk Register.md).
