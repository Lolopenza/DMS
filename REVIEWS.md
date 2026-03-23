# DMC Platform — Architectural Review & Roadmap

> Deep analysis of the Discrete Math Calculator (DMC) platform.
> Covers architecture, security, code quality, diploma-strengthening features, and a production roadmap.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architectural Review](#2-architectural-review)
   - 2.1 [Microservice Communication](#21-microservice-communication)
   - 2.2 [Security (JWT / Sessions)](#22-security-jwt--sessions)
   - 2.3 [Database Schema](#23-database-schema)
   - 2.4 [Infrastructure & Docker](#24-infrastructure--docker)
3. [Code Quality Audit](#3-code-quality-audit)
   - 3.1 [Dead Code & Unused Dependencies](#31-dead-code--unused-dependencies)
   - 3.2 [Error Handling Issues](#32-error-handling-issues)
   - 3.3 [Docker Configuration Issues](#33-docker-configuration-issues)
4. [Diploma-Strengthening Feature Proposals](#4-diploma-strengthening-feature-proposals)
5. [Production Roadmap](#5-production-roadmap)
6. [Best Practices Checklist](#6-best-practices-checklist)

---

## 1. Project Overview

| Layer | Technology | Status |
|-------|-----------|--------|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, React Router 6 | Functional — 5 subjects, ~30 calculator modules |
| **Backend** | Spring Boot 3.2.5, Java 21, JPA/Hibernate, Flyway | Auth-only — full CRUD for users/sessions/tokens |
| **Math Engine** | FastAPI, Python 3.11, SymPy, NumPy, NetworkX | Functional — 12 API routers, 88 tests |
| **AI Module** | `dmc_ai` — Google Gemini + Groq fallback, in-memory RAG | Prototype — 4 hardcoded docs, no persistent index |
| **Infrastructure** | Docker Compose, Nginx, PostgreSQL 16, Redis 7, RabbitMQ 3.13 | Development-ready, no CI/CD |

**Architecture diagram (logical flow):**

```
Browser ──► Nginx (:80) ──┬──► Frontend (SPA, :3000 dev)
                          ├──► Backend (:8080) ──► PostgreSQL / Redis / RabbitMQ
                          └──► Math Engine (:8081) ──► dmc_ai (Gemini/Groq)
```

---

## 2. Architectural Review

### 2.1 Microservice Communication

#### Current State

- **Frontend → Math Engine**: Direct HTTP POST via Vite proxy (`/api/v1/*` → `:8081`) or Nginx reverse proxy in production.
- **Frontend → Backend**: Direct HTTP via Vite proxy (`/api/*` → `:8080`) or Nginx.
- **Backend → Math Engine**: The `DMC_MATH_ENGINE_URL` env var exists in Docker Compose, but **no backend code actually calls the math engine**. The Spring Boot `spring-boot-starter-webflux` dependency is present (for `WebClient`) but unused.
- **RabbitMQ**: Running in infrastructure but **zero producers or consumers** are implemented. No queue declarations, no message handlers.
- **Redis**: Backend depends on `spring-boot-starter-data-redis` and the Redis container, but **no caching, rate-limiting, or session storage logic** is implemented.

#### Weaknesses

| Issue | Severity | Detail |
|-------|----------|--------|
| **No backend proxy for math engine** | High | The frontend calls the math engine directly. In production, computation requests bypass authentication, rate-limiting, and audit logging on the backend. |
| **No inter-service auth** | High | Math engine has `allow_origins=["*"]` and no API key or service token. Any client can call it directly. |
| **RabbitMQ is dead weight** | Medium | Container runs, config is wired, but no message broker code exists in either the backend or math engine. |
| **Redis unused** | Medium | Redis is deployed and configured but never used for caching, token blacklisting, or session storage. |
| **Synchronous-only communication** | Medium | All requests are synchronous HTTP. Long-running computations (large matrix operations, AI chat) block the request thread and can cause timeouts. |
| **No circuit breaker / retry** | Medium | If the math engine is down, the frontend gets a raw connection error. No fallback, no retry logic. |

#### Recommendations

1. **Proxy math-engine calls through the backend** — add a `CalculatorController` in Spring Boot that forwards requests to the math engine using `WebClient`. This enables authentication, rate-limiting, and logging server-side.
2. **Add inter-service authentication** — use a shared API key or mutual TLS between backend and math engine. Remove `allow_origins=["*"]` from the math engine CORS config.
3. **Use RabbitMQ for async tasks** — chat AI responses, OCR processing, and batch computations should be published to RabbitMQ queues and processed asynchronously. Return a job ID to the frontend and let it poll or subscribe via WebSocket.
4. **Use Redis for caching and rate-limiting** — cache math engine responses (same input → same output), store JWT blacklists (for immediate revocation), and implement per-user rate limiting.
5. **Add health-check endpoints for all services** — the backend already has `/actuator/health`; add dependency checks for PostgreSQL, Redis, RabbitMQ, and math engine reachability.

---

### 2.2 Security (JWT / Sessions)

#### Current Strengths

The auth system is **well-implemented for an MVP**:

- Refresh token rotation with reuse detection (revokes all sessions on replay).
- BCrypt with cost factor 12.
- SHA-256 hashing of refresh tokens before storage (tokens are not stored in plaintext).
- Account lockout after 5 failed attempts (configurable).
- HttpOnly cookies for tokens with configurable `Secure`, `SameSite`, and `Domain`.
- Session management (list, revoke individual, revoke all).
- Password reset with hashed, time-limited, single-use tokens.

#### Weaknesses

| Issue | Severity | Detail |
|-------|----------|--------|
| **JWT secret from env var** | High | `JWT_SECRET` is a plain string in `.env`. In production, this should come from a secrets manager (Vault, AWS Secrets Manager) and be at least 256 bits of entropy, not a human-readable phrase. |
| **No access token revocation** | High | Access tokens (15 min TTL) cannot be revoked immediately. If a session is revoked, the access token is still valid until expiry. Redis-backed blacklist is needed. |
| **CSRF protection disabled** | Medium | CSRF is disabled (`csrf(AbstractHttpConfigurer::disable)`). While stateless JWT APIs don't need CSRF for `Authorization` header auth, the app also uses cookies — cookie-based auth without CSRF protection is vulnerable to cross-site request forgery. |
| **Math engine has no auth** | High | All math engine endpoints are public. No JWT verification, no API key. Anyone can call `/api/v1/chat/` directly. |
| **Sensitive data in JWT claims** | Low | Email and role are in the JWT payload. While not secret, this leaks user PII in every request header and can be read by browser JavaScript (access token is also sent via `Authorization` header, not just HttpOnly cookies). |
| **No rate-limiting** | Medium | No rate-limiting on auth endpoints. While account lockout exists, brute-force enumeration of emails via the `/register` endpoint (which reveals "email taken") is unprotected. |
| **Frontend stores JWT in localStorage** | Medium | `api.js` reads `localStorage.getItem('jwt_token')`. LocalStorage is vulnerable to XSS. The cookie-based approach is already implemented server-side but the frontend has a dual mechanism. |
| **GlobalExceptionHandler swallows stack traces** | Low | The generic `Exception` handler returns `INTERNAL_ERROR` without logging. Add `log.error()` to prevent silent failures in production. |

#### Recommendations

1. **Remove localStorage JWT storage** — rely solely on HttpOnly cookies. Remove `getAuthHeaders()` from `api.js` or keep it only as a fallback for mobile API clients.
2. **Add CSRF protection** — implement double-submit cookie pattern or Spring Security's `CookieCsrfTokenRepository` for cookie-based auth.
3. **Implement Redis-based token blacklist** — on session revocation, add the access token's `jti` (or `sessionId` + `iat`) to a Redis set with TTL matching the token's remaining life.
4. **Add rate-limiting** — use Spring Boot's `RateLimiter` or a Redis-backed sliding window on `/api/auth/*` endpoints.
5. **Rotate JWT signing keys** — implement key rotation by embedding a `kid` (key ID) in the JWT header and supporting multiple active keys during rotation.

---

### 2.3 Database Schema

#### Current State

11 Flyway migrations define: `users`, `courses`, `course_modules`, `lessons`, `lesson_progress`, `refresh_tokens`, `problems`, `problem_attempts`, `subscriptions`, `payment_history`, `calc_history`, `chat_sessions`, `chat_messages`, `user_sessions`, `password_reset_tokens`.

#### Weaknesses

| Issue | Severity | Detail |
|-------|----------|--------|
| **Schema exists, code doesn't** | High | Tables for `courses`, `lessons`, `problems`, `subscriptions`, `calc_history`, `chat_sessions`, and `chat_messages` exist in the DB, but the backend has **no JPA entities, repositories, services, or controllers** for them. These are "schema-only" features. |
| **No soft-delete filtering** | Medium | `deleted_at` columns exist on most tables, but the backend has no `@Where(clause = "deleted_at IS NULL")` annotation or equivalent Hibernate filter. |
| **No `TEACHER` role** | Medium | `user_role` enum is `('STUDENT', 'ADMIN')`. An educational platform needs a `TEACHER` / `INSTRUCTOR` role for content creation and grading. |
| **Difficulty enum is too coarse** | Low | `difficulty` is `('EASY', 'MEDIUM', 'HARD')`. Adaptive difficulty needs a continuous or fine-grained scale (e.g., 1–10 or Elo-like rating). |
| **No skill/competency model** | High | There is no table tracking which mathematical skills/competencies a student has mastered. The `xp` and `streak` fields on `users` are gamification-only; they don't model knowledge state. |
| **No problem tagging taxonomy** | Medium | `problems.topic` is a free-text `VARCHAR(100)`. There is no normalized `topics` table, no many-to-many relationship, and no tag hierarchy. |
| **Chat messages lack metadata** | Low | `chat_messages` has no fields for `tokens_used`, `model_used`, `latency_ms`, or `feedback_rating`. This data is essential for cost tracking and AI quality evaluation. |
| **No indexes on `problem_attempts` for analytics** | Low | Missing composite index on `(user_id, problem_id, correct)` which is needed for mastery queries like "how many correct attempts per topic?". |

#### Recommendations

1. **Build JPA entities and REST APIs for courses, lessons, and problems** — these are the core educational domain objects. Without them, the platform is just a calculator + auth.
2. **Add a `student_skills` table** — columns: `user_id`, `topic`, `skill_level` (float, 0.0–1.0), `attempts_count`, `last_attempt_at`. This enables adaptive difficulty selection.
3. **Migrate `problems.topic` to a normalized taxonomy** — create a `topics` table with `id`, `slug`, `parent_id`, `subject_id` and a `problem_topics` join table.
4. **Add a `TEACHER` role to `user_role` enum** — new Flyway migration: `ALTER TYPE user_role ADD VALUE 'TEACHER'`.
5. **Implement Hibernate soft-delete filters** — use `@SQLRestriction("deleted_at IS NULL")` (Hibernate 6.4+) on all soft-deletable entities.

---

### 2.4 Infrastructure & Docker

#### Current Strengths

- Multi-stage Dockerfiles for backend (Maven build → JRE runtime) and math engine (slim Python).
- Non-root users (`dmc`) in both containers.
- Production overlay (`docker-compose.prod.yml`) with `security_opt`, `cap_drop`, `read_only`.
- Healthchecks for all services.
- Nginx with proper SPA fallback, separate upstream routing for `/api/v1/` and `/api/`.

#### Weaknesses

See [Section 3.3](#33-docker-configuration-issues) for detailed Docker issues.

---

## 3. Code Quality Audit

### 3.1 Dead Code & Unused Dependencies

| Item | Location | Issue |
|------|----------|-------|
| **`spring-boot-starter-webflux`** | `backend/pom.xml` | Dependency is declared but `WebClient` is never used anywhere in the codebase. |
| **`spring-boot-starter-amqp`** | `backend/pom.xml` | RabbitMQ starter is declared but no `@RabbitListener`, no `RabbitTemplate`, no queue/exchange declarations exist. |
| **`spring-boot-starter-data-redis`** | `backend/pom.xml` | Redis starter is declared but no `RedisTemplate`, `@Cacheable`, or Redis-based logic exists. |
| **`spring-boot-starter-mail`** | `backend/pom.xml` | Mail starter is declared and `EmailService.java` exists, but the email service likely does nothing useful without a real SMTP server (default is `localhost:1025`). |
| **`spring-boot-starter-aop`** | `backend/pom.xml` | AOP starter is declared but no `@Aspect` classes exist. |
| **`stripe-java`** | `backend/pom.xml` | Stripe SDK v25.10.0 is declared but no Stripe integration code exists. The `subscriptions` and `payment_history` tables exist in the DB but have no backend code. |
| **`mapstruct`** | `backend/pom.xml` | MapStruct is declared (with annotation processor) but no `@Mapper` interfaces exist. DTOs are constructed manually. |
| **`MCP_SERVER_URL` / `MCP_ENABLED`** | `math-engine/utils/config.py` | MCP configuration variables are defined but never imported or used anywhere in the math engine. |
| **`FLASK_ENV` / `FLASK_DEBUG`** | `docker-compose.override.yml` | Math engine uses FastAPI/Uvicorn, not Flask. These environment variables have no effect. |
| **`easyocr`** | `math-engine/requirements.txt` | Heavy dependency (~1.5GB model download) used only in `ocr.py`, which is a single endpoint. The OCR reader is re-instantiated on every request (no caching). |
| **`pandas`** | `math-engine/requirements.txt` | Listed in requirements but no `import pandas` found in the math-engine source code. |
| **Unused test files** | `math-engine/tests/ai/` | `test_rag_pipeline.py` and `test_rag_eval.py` import from `dmc_ai` which is a separate package — these tests may fail if `dmc_ai` is not installed. |
| **`scripts/verify-critical-flows.mjs`** | `frontend/scripts/` | Script exists but is not referenced in `package.json` scripts. |

### 3.2 Error Handling Issues

| Item | Location | Issue |
|------|----------|-------|
| **Silent exception swallowing** | `JwtAuthenticationFilter.java:51` | `catch (Exception ignored)` — JWT parsing errors, DB errors, and network errors during authentication are silently swallowed. Should at least log at `DEBUG` level. |
| **`GlobalExceptionHandler` has no logging** | `GlobalExceptionHandler.java:33` | The generic `Exception` handler returns a 500 response but does not log the exception. In production, this means server errors are invisible. |
| **OCR re-creates reader per request** | `math-engine/api/v1/ocr.py:16` | `easyocr.Reader(['en'], gpu=False)` is called on every request. This is extremely slow (~2-5 seconds initialization). The reader should be a module-level singleton. |
| **OCR broad exception catch** | `math-engine/api/v1/ocr.py:19` | `except Exception as e: raise HTTPException(500, ...)` — catches absolutely everything including `KeyboardInterrupt` and `SystemExit`. Should catch `(IOError, ValueError, RuntimeError)` specifically. |
| **Chat error string matching** | `math-engine/api/v1/chat.py:26` | Error detection via `'429' in err` is fragile. A message containing "Use 429 tokens" would incorrectly trigger a 429 response. Use structured error codes instead. |
| **Chatbot exception hierarchy** | `dmc_ai/chatbot.py:183–194` | Error classification via substring matching (`'429' in lower_msg`) is brittle. Should catch specific exception types from the Gemini SDK. |
| **Frontend swallows auth errors** | `AuthContext.jsx:23`, `AuthContext.jsx:57` | `catch {}` with no error handling — bootstrap and logout errors are silently swallowed. |
| **No request timeout on frontend** | `frontend/src/api.js` | `fetch()` calls have no `AbortController` timeout. A hung backend or math engine will cause the UI to appear frozen indefinitely. |

### 3.3 Docker Configuration Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| **Port 5672 conflict (RabbitMQ)** | Medium | In `docker-compose.override.yml`, RabbitMQ maps to `5673:5672` and `15673:15672`. However, AGENTS.md instructions and the backend env vars use port `5672`, which is the **container-internal** port. When running locally (outside Docker), the backend should connect to `localhost:5673`, not `5672`. This causes connection failures when running the backend outside Docker while Docker Compose is active. |
| **No port mapping for postgres/redis in base compose** | Low | The base `docker-compose.yml` does not expose ports for PostgreSQL and Redis. Only the override file maps `5432:5432` and `6379:6379`. This is intentional for production but confusing for developers who run `docker compose up` without the override. |
| **Frontend Dockerfile missing** | Medium | No Dockerfile exists for the frontend. The dev override uses `node:20-alpine` with inline commands, but there is no production frontend build. The Nginx container relies on a pre-built `frontend/dist/` directory. |
| **Nginx serves stale frontend** | Low | Nginx mounts `./frontend/dist` as read-only, but no CI/CD step builds the frontend. If `dist/` is outdated or missing, Nginx serves stale or broken content. |
| **`FLASK_ENV` / `FLASK_DEBUG`** | Low | Math engine override sets Flask variables, but the app uses FastAPI. These have no effect. |
| **No resource limits** | Medium | No `mem_limit`, `cpus`, or `ulimits` are set on any service. A runaway computation in the math engine or a memory leak could crash the host. |
| **Secrets in `.env`** | Medium | `.env` is committed to git (found in the repository). It contains `JWT_SECRET`, database passwords, and API keys. Even though `.gitignore` lists `.env`, the file already exists in the working tree. |

---

## 4. Diploma-Strengthening Feature Proposals

These 7 features directly support the diploma topic: **"Development of a web platform using an AI system for the formation of mathematical skills"**.

---

### Feature 1: Adaptive Difficulty Engine (BKT-based)

**What**: Implement Bayesian Knowledge Tracing (BKT) to model each student's mastery of individual math skills. The system selects problem difficulty based on estimated mastery probability.

**Why it strengthens the diploma**: This is the core "AI system for formation of mathematical skills". BKT is a proven model in Intelligent Tutoring Systems (ITS) research with clear mathematical formulation suitable for a diploma paper.

**Implementation outline**:
- New DB tables: `student_skills(user_id, topic_id, p_know, p_guess, p_slip, p_transit, updated_at)`.
- After each `problem_attempt`, run BKT update: `P(L_n | obs) = P(L_n|obs) * P(obs|L_n) / P(obs)`.
- Expose `/api/problems/next` endpoint that selects problems where `p_know` is in the Zone of Proximal Development (0.3–0.7).
- Frontend displays a mastery heatmap per topic on the dashboard.

**Academic value**: BKT has formal proofs of convergence and connects to Hidden Markov Models (HMMs), giving the diploma a strong theoretical foundation.

---

### Feature 2: Step-by-Step Solution Scaffolding with AI Hints

**What**: When a student gets a problem wrong, the AI provides progressively more specific hints rather than the full solution. First hint: direction. Second hint: formula. Third hint: worked first step. Fourth: full solution.

**Why it strengthens the diploma**: Demonstrates pedagogical scaffolding theory (Vygotsky's ZPD) implemented through AI. Differentiates the platform from a plain calculator.

**Implementation outline**:
- Add `hint_level` field to `problem_attempts`.
- Math engine endpoint `/api/v1/problems/{id}/hint?level=N` generates contextual hints using Gemini.
- RAG pipeline retrieves the relevant educational content and solution template.
- Frontend shows a "Get Hint" button with progressive disclosure.

---

### Feature 3: Interactive Problem Generation (AI-Driven)

**What**: AI generates new math problems tailored to the student's current skill level and weak topics. Problems are parameterized (different numbers each time) with auto-verified answers.

**Why it strengthens the diploma**: Demonstrates generative AI applied to education — a hot research topic. Infinite problem supply eliminates the content bottleneck.

**Implementation outline**:
- Create problem templates in the DB with parameterizable fields (e.g., `"Find C({n}, {k})"` where `n` and `k` are ranges).
- Math engine generates concrete problem instances and computes correct answers.
- For open-ended problems, Gemini generates the problem text and the math engine verifies the answer.
- Track generated problems separately: `generated_problems(id, template_id, params_json, correct_answer, difficulty_score)`.

---

### Feature 4: Learning Analytics Dashboard

**What**: A comprehensive dashboard showing: mastery progression over time, topic strengths/weaknesses radar chart, time-per-problem trends, streak and XP leaderboard, predicted time to mastery.

**Why it strengthens the diploma**: Demonstrates data-driven educational decision-making. The "predicted time to mastery" metric uses the BKT model, tying features 1 and 4 together.

**Implementation outline**:
- Backend aggregation endpoints: `/api/analytics/progress`, `/api/analytics/mastery-prediction`, `/api/analytics/leaderboard`.
- Use PostgreSQL `window functions` and `LATERAL` joins for time-series analytics.
- Frontend: React components with SVG-based charts (no heavy charting library needed; use lightweight `recharts`).
- Export capability: PDF report generation for academic portfolio.

---

### Feature 5: Real-Time Collaborative Problem Solving

**What**: Students can share a problem session with peers or a teacher. Both see the same problem, can type solutions simultaneously, and the AI mediates by providing hints to the struggling participant.

**Why it strengthens the diploma**: Demonstrates WebSocket integration, real-time systems, and collaborative learning theory (CSCL — Computer-Supported Collaborative Learning).

**Implementation outline**:
- Use RabbitMQ (already deployed) as the message broker for real-time events.
- WebSocket endpoint via Spring Boot: `/ws/collab/{sessionId}`.
- Shared state: problem, each participant's current answer, hint requests.
- AI observer: monitors both participants' progress and sends targeted hints to the one who is stuck.

---

### Feature 6: Spaced Repetition Review System

**What**: After a student demonstrates mastery of a topic, schedule review problems at increasing intervals (1 day, 3 days, 7 days, 14 days, 30 days) using the SM-2 algorithm (SuperMemo).

**Why it strengthens the diploma**: Demonstrates memory science (Ebbinghaus forgetting curve) applied to mathematical skill retention. Directly supports "formation of mathematical skills" — formation implies long-term retention, not just one-time learning.

**Implementation outline**:
- New table: `review_schedule(user_id, topic_id, next_review_at, interval_days, ease_factor, repetition_count)`.
- After each review attempt, update using SM-2: `new_interval = old_interval * ease_factor`.
- Daily notification (email or in-app) listing topics due for review.
- Dashboard widget: "Review Queue (3 topics due today)".

---

### Feature 7: AI-Powered Error Pattern Analysis

**What**: The AI analyzes a student's history of wrong answers across problems and identifies systematic misconceptions (e.g., "consistently confuses permutations with combinations", "forgets to account for the base case in induction proofs").

**Why it strengthens the diploma**: This is genuine AI-driven personalization — not just "AI generates content" but "AI diagnoses learning gaps". Publishable as a research contribution.

**Implementation outline**:
- Batch job (weekly or on-demand) that queries all `problem_attempts` where `correct = false` for a user.
- Cluster wrong answers by topic and error type.
- Send clustered error data to Gemini with a diagnostic prompt: "Given these wrong answers in combinatorics, identify the most likely misconception."
- Store results in `student_misconceptions(user_id, topic_id, misconception_text, confidence, detected_at)`.
- Show on dashboard: "Your AI tutor noticed: You tend to confuse nPr and nCr. Here's a targeted exercise."

---

## 5. Production Roadmap

### Phase 1: Foundation Hardening (Core Infrastructure)

**Goal**: Make the existing MVP reliable, secure, and deployable.

| Step | Task | Components |
|------|------|------------|
| 1.1 | **Remove dead dependencies** — delete unused Maven starters (`webflux`, `amqp`, `aop`, `stripe`; keep `redis` and `mail` for upcoming features). Remove `pandas`, `FLASK_ENV`/`FLASK_DEBUG`. | Backend, Math Engine, Docker |
| 1.2 | **Fix Docker port mapping** — align RabbitMQ ports in override with AGENTS.md. Add resource limits. Remove committed `.env`. | Docker |
| 1.3 | **Add CI/CD pipeline** — GitHub Actions: lint (flake8, ESLint), test (pytest, future JUnit), build (Maven, Vite, Docker), deploy (staging). | Infrastructure |
| 1.4 | **Implement Redis caching** — cache math engine responses by input hash (TTL 1 hour). Add JWT blacklist for immediate session revocation. | Backend |
| 1.5 | **Add frontend request timeouts** — wrap `fetch()` with `AbortController` (30s timeout for computations, 60s for AI chat). | Frontend |
| 1.6 | **Fix error handling** — add logging to `GlobalExceptionHandler`, replace silent `catch` blocks, singleton EasyOCR reader. | Backend, Math Engine |
| 1.7 | **Add CSRF protection** — implement double-submit cookie for cookie-authenticated endpoints. Remove `localStorage` JWT fallback. | Backend, Frontend |

### Phase 2: Educational Domain (Content & Problems)

**Goal**: Transform from "calculator" to "learning platform" by implementing the educational domain.

| Step | Task | Components |
|------|------|------------|
| 2.1 | **Build Course/Lesson CRUD** — JPA entities, repositories, services, and REST controllers for `courses`, `course_modules`, `lessons`, `lesson_progress`. Admin UI for content management. | Backend, Frontend |
| 2.2 | **Build Problem Engine** — JPA entities for `problems`, `problem_attempts`. REST API for submitting answers, getting feedback, and tracking attempts. | Backend |
| 2.3 | **Implement problem templates** — parameterized problem generation for infinite practice. Math engine validates answers. | Math Engine, Backend |
| 2.4 | **Add `TEACHER` role** — Flyway migration, role-based access control for content creation. | Backend, DB |
| 2.5 | **Build topic taxonomy** — normalized `topics` table, many-to-many with problems, hierarchical categories. | DB, Backend |
| 2.6 | **Proxy math engine through backend** — `CalculatorController` that authenticates users, logs calculations to `calc_history`, and forwards to math engine. Add inter-service API key. | Backend, Math Engine |

### Phase 3: AI Tutor System (Adaptive Intelligence)

**Goal**: Implement the "AI system for the formation of mathematical skills" — the diploma's core contribution.

| Step | Task | Components |
|------|------|------------|
| 3.1 | **Implement BKT skill model** (Feature 1) — student skill tracking, mastery estimation, adaptive problem selection. | Backend, DB |
| 3.2 | **Build hint scaffolding system** (Feature 2) — progressive hints via AI with pedagogical scaffolding levels. | Math Engine, Backend, Frontend |
| 3.3 | **AI problem generation** (Feature 3) — template-based and fully generative problem creation. | Math Engine, Backend |
| 3.4 | **Error pattern analysis** (Feature 7) — batch misconception detection and personalized feedback. | Backend, dmc_ai |
| 3.5 | **Upgrade RAG pipeline** — replace hardcoded 4-document index with a vector database (Qdrant or pgvector). Index all educational content. | dmc_ai, Infrastructure |
| 3.6 | **Implement spaced repetition** (Feature 6) — SM-2 algorithm, review scheduling, daily reminders. | Backend, Frontend |

### Phase 4: Engagement & Analytics

**Goal**: Make learning addictive and measurable.

| Step | Task | Components |
|------|------|------------|
| 4.1 | **Learning analytics dashboard** (Feature 4) — mastery progression, radar charts, time-to-mastery predictions. | Backend, Frontend |
| 4.2 | **Real-time collaboration** (Feature 5) — WebSocket sessions, shared problem-solving with AI mediator. | Backend (RabbitMQ, WebSocket), Frontend |
| 4.3 | **Gamification enhancements** — achievements, badges, course completion certificates. | Backend, Frontend |
| 4.4 | **Subscription & payments** — implement Stripe integration using the existing schema and dependency. | Backend, Frontend |

### Phase 5: Production Deployment

**Goal**: Deploy a production-grade, scalable platform.

| Step | Task | Components |
|------|------|------------|
| 5.1 | **Frontend production build** — create `frontend/Dockerfile` with multi-stage build (Node → Nginx). | Docker |
| 5.2 | **Kubernetes manifests or Docker Swarm config** — horizontal scaling for math engine and backend. | Infrastructure |
| 5.3 | **Observability stack** — Prometheus + Grafana for metrics, ELK/Loki for logs, Jaeger for distributed tracing. | Infrastructure |
| 5.4 | **Load testing** — k6 or Locust tests for math engine (target: 100 concurrent computations). | Testing |
| 5.5 | **Security audit** — OWASP ZAP scan, dependency vulnerability scan (Snyk/Trivy), penetration testing. | Security |
| 5.6 | **Documentation** — API docs (SpringDoc already configured), user guide, deployment guide, architecture decision records. | Documentation |

---

## 6. Best Practices Checklist

### Backend (Spring Boot)

- [ ] Remove unused Maven dependencies (webflux, amqp, aop, stripe, mapstruct)
- [ ] Add logging to `GlobalExceptionHandler` for generic exceptions
- [ ] Implement `@SQLRestriction` for soft-delete filtering
- [ ] Add request validation (`@Valid`) on all controller methods
- [ ] Implement API versioning (`/api/v1/auth/*`)
- [ ] Add OpenAPI annotations to all endpoints
- [ ] Write integration tests for auth flows (testcontainers setup already exists)
- [ ] Implement proper CORS configuration (remove wildcard origins)
- [ ] Add rate-limiting middleware

### Math Engine (FastAPI)

- [ ] Remove `allow_origins=["*"]` — restrict to backend origin only
- [ ] Add API key authentication for inter-service calls
- [ ] Singleton pattern for EasyOCR reader (avoid per-request initialization)
- [ ] Remove unused `pandas` dependency
- [ ] Remove unused `MCP_SERVER_URL` / `MCP_ENABLED` config
- [ ] Add request/response logging middleware
- [ ] Add structured error codes (not string matching)
- [ ] Pin all dependency versions (use `requirements.lock.txt` as the source of truth)

### Frontend (React)

- [ ] Remove `localStorage` JWT storage — use HttpOnly cookies exclusively
- [ ] Add `AbortController` timeouts to all `fetch()` calls
- [ ] Add error boundaries to prevent white-screen crashes
- [ ] Add loading skeletons instead of blank states
- [ ] Implement proper 401 handling — auto-refresh token, then retry the original request
- [ ] Add end-to-end tests (Playwright or Cypress)
- [ ] Add ESLint configuration

### Infrastructure

- [ ] Fix RabbitMQ port conflict in Docker override
- [ ] Remove `.env` from git history (`git filter-branch` or BFG)
- [ ] Add GitHub Actions CI pipeline
- [ ] Create `frontend/Dockerfile` for production
- [ ] Add resource limits to Docker Compose services
- [ ] Set up pre-commit hooks (lint, format, type-check)
- [ ] Add Docker healthcheck dependencies (backend waits for math engine)

---

*Generated on: 2026-03-22 | Analyzer: Deep Project Review Agent*
