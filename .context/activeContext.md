# Active Context

## Current Phase
Enhancement & Complete Polish of Core Modules

## Current Goal
Ensure all six core StudyAI modules are feature-complete, responsive, and compile-safe.

## Current Tasks
- [x] Configure duplicate check, soft-delete, restore, and permanent purge in material upload.
- [x] Retain and select from multiple version histories in document summary.
- [x] Map card player keyboard shortcuts and multi-format exporters (PDF, MD, CSV, JSON) in Flashcards.
- [x] Enable auto-save and resumption via localStorage, and attempt exporters in Quizzes.
- [x] Build drag-and-drop rescheduling in weekly/monthly scheduler grids.
- [x] Embed Radar chart, streak counters, readiness scores, and export buttons in Performance Analytics.
- [x] Separate Summary, Flashcards, and Quiz modules into dedicated routes with fallback material selection dropdowns.
- [x] Add document selector and manual scheduling options to the study planner.
- [x] Update global theme variables to minimalist titanium and warm bronze accents.
- [x] Deploy split-view login screen with smooth floating CSS animations of books, study tools, achievements, and user activities.

## Current Decisions
- Kept print generation inside client iframe elements to make PDF exports fast and secure without backend rendering engines.
- Extended the global database schema using the existing JSON Mock fallback without breaking backward compatibility.
- Chose high-contrast Titanium Charcoal & Warm Bronze/Amber styling to eliminate generic neon pink/blue gradient combinations.

## Current Blockers
None
