# Product Context

## Product Vision
StudyAI aims to give every student a single, intelligent dashboard that converts raw study material (PDFs, DOCX files, or pasted text) into structured, exam-ready learning content, and adapts that content over time based on the student's demonstrated strengths and weaknesses.

## Mission
To reduce the time students spend manually creating study materials and to provide adaptive, personalized study plans that optimize revision efficiency and surface weak areas.

## Target Users
- **Primary Persona**: The Exam-Prep Student (Undergraduate or postgraduate preparing for exams, juggling multiple subjects).
- **Secondary Persona**: The Self-Learner (Independent learner studying a new subject or certification outside formal coursework).

## User Personas
1. **The Exam-Prep Student**: Limited time, difficulty identifying weak areas, no structured revision plan. Needs to convert dense textbook chapters into digestible summaries and quizzes quickly.
2. **The Self-Learner**: No instructor to set quizzes or pace, needs self-assessment tools. Needs to build structured learning content from scattered notes and articles.

## Core Features
1. Study Material Upload (PDF, DOCX, text)
2. AI Summary Generation
3. Flashcard Generation Engine
4. Adaptive Quiz Generator & Evaluation
5. Weak Topic Identification
6. Personalized Study Schedule Planner
7. Learning Analytics & Dashboard
8. Appointment Management

## Feature Relationships
- Uploaded materials are the source for Summaries, Flashcards, and Quizzes.
- Quiz results inform Weak Topic Identification and Learning Analytics.
- Weak Topics drive the Personalized Study Schedule Planner.
- Appointments integrate with the Study Schedule.

## Primary User Journey
1. User logs in/signs up.
2. User uploads study material (PDF/DOCX/text).
3. User generates and reviews a markdown summary of the material.
4. User generates a flashcard deck and reviews it interactively.
5. User takes an AI-generated quiz and receives scored feedback.
6. The system identifies weak topics based on quiz performance.
7. User generates a 7-day personalized study schedule incorporating weak topics.
8. User tracks progress and weak-topic trends on the analytics dashboard.

## Target Audience
- **High School & College Students:** Needing quick summaries and practice tests from dense textbooks.
- **Professionals & Certification Seekers:** Needing to memorize complex frameworks and terminologies.
- **Lifelong Learners:** Anyone looking to extract actionable knowledge from PDFs or notes.

## Current Project Status: MVP COMPLETE
- Phase 10 (Production Deployment & Go-Live) is officially complete.
- The platform features Firebase Authentication, AI-powered document extraction (via Groq `llama-3.3-70b-versatile`), responsive UI, spaced repetition flashcards, automated quiz generation, and a personalized study planner.
- The architecture is configured for CI/CD via GitHub Actions, Vercel SPA routing, and Dockerized WSGI backend deployment.
- The system is currently in "Maintenance & Future Enhancements" mode.

## Business Goals
- Reduce the time students spend manually creating study content.
- Provide adaptive study plans responding to quiz performance.
- Surface weak topics automatically for efficient revision.
- Deliver clear analytics on study progress.
- Ensure a highly responsive, premium SaaS experience across all devices.

## Success Metrics
- Material-to-content conversion rate: > 90%
- Quiz completion rate: > 80%
- Weak topic recurrence: > 25% reduction over 2 weeks
- AI response latency: < 8s (summaries/flashcards), < 15s (quizzes)
- Dashboard engagement: > 3 sessions per active user per week

## Future Roadmap
- OCR support for scanned/image-based PDFs.
- Multi-language material support and summary generation.
- Collaborative study groups and shared flashcard decks.
- Native mobile applications.
- Spaced-repetition scheduling for flashcards.
- Integration with calendar apps for appointments and schedule sync.
