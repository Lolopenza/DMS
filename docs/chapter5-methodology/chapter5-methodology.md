# Chapter 5. Methodology and System Design

## 5.1 Methodology of the Work

### 5.1.1 Software Development Life Cycle Approach

The development of the Discrete Math Calculator (DMC) platform followed an iterative, incremental methodology grounded in the Agile framework, with specific practices drawn from Scrum. This approach was selected for several reasons directly relevant to the nature of the project. First, the DMC platform is a multi-tier web application integrating heterogeneous technologies—a Java backend, a Python computational engine, and a React frontend—where requirements evolve as the interplay between components becomes clearer during implementation. Second, the educational domain introduces inherent uncertainty: pedagogical features such as adaptive difficulty and AI-driven problem generation require empirical validation with real interaction patterns, making upfront waterfall-style specification impractical. Third, as a diploma project developed by a single author under academic supervision, the feedback loop between supervisor review and development iterations maps naturally onto the Scrum sprint cycle, where each sprint concludes with a demonstrable increment reviewed by a stakeholder.

The project was organized into five development phases (referred to as "waves" in the internal documentation), each corresponding to a thematic milestone. Wave 1 established the computational engine and basic frontend calculator. Wave 2 introduced the Spring Boot backend with authentication, database migrations, and the API gateway pattern. Wave 3 built the educational domain: courses, lessons, teacher roles, problem templates, and AI-driven problem generation with hybrid verification. Wave 4 implemented Bayesian Knowledge Tracing for adaptive difficulty selection. Wave 5 refined integration, testing, and documentation for diploma submission.

Within each wave, work was decomposed into user stories expressed in the standard format: "As a [role], I want to [action] so that [benefit]." Each story carried acceptance criteria specifying both functional behavior and non-functional constraints (response time under 3 seconds for computation endpoints, minimum 80% test coverage for the math engine). A product backlog was maintained as a prioritized list of stories; at the start of each sprint (typically one to two weeks), the highest-priority stories were selected for the sprint backlog based on estimated effort and dependencies.

### 5.1.2 Artifacts and Ceremonies

The primary artifacts produced during the development process include the product backlog (tracked in the repository issue tracker and internal Markdown files), sprint backlogs for each wave, the Flyway migration history (V1 through V14) serving as a versioned record of schema evolution, an architectural review document (REVIEWS.md) functioning as a living architecture decision record, and automated test suites (88 tests for the math engine at the time of writing). Code review was performed through pull requests, with each merge requiring a passing CI pipeline (lint checks via flake8, unit and integration tests via pytest, and compilation verification via Maven).

Sprint retrospectives after each wave produced actionable improvements. For example, after Wave 2 the retrospective identified that direct frontend-to-math-engine communication bypassed authentication, leading to the API gateway refactoring in Wave 3. After Wave 3, the retrospective noted the absence of a student knowledge model, directly motivating the BKT implementation in Wave 4.

### 5.1.3 Risk Management

The following risks were identified at the project inception and managed throughout development.

**Technical risk: LLM reliability.** The dependence on Google Gemini for problem generation and semantic answer verification introduces a risk of hallucinated or incorrect outputs. This was mitigated by the hybrid verification architecture: SymPy provides deterministic symbolic checking as the primary verification path, with LLM verification used only when symbolic methods cannot be applied. A confidence score is returned with every LLM judgment, allowing the frontend to display appropriate caveats.

**Technical risk: Inter-service coupling.** The three-tier architecture (React, Spring Boot, FastAPI) creates inter-service dependencies where the failure of one component can cascade. This was mitigated by implementing structured error handling in the API gateway (CalculatorProxyService maps math engine failures to typed error codes such as MATH_ENGINE_ERROR and MATH_ENGINE_UNAVAILABLE), providing fallback problem templates when AI generation fails, and designing the frontend to degrade gracefully with informative error messages.

**Schedule risk: Scope creep.** The educational domain is vast, and the temptation to implement features such as collaborative learning, spaced repetition, and gamification simultaneously was managed through strict MoSCoW prioritization (detailed in Section 5.4). Only Must-have features were committed to the diploma scope; Should-have features were documented as future work.

**External dependency risk: API cost and rate limits.** The Gemini API has per-minute token limits and per-month cost ceilings. This was addressed by implementing a template-based generation mode as an alternative to AI generation, caching generated problems in the database (JSONB snapshots in the generated_problems table), and planning Redis-based response caching for frequently requested computations.

---

## 5.2 System Architecture

### 5.2.1 Architectural Overview

The DMC platform employs a three-tier client-server architecture augmented with a dedicated AI/computation microservice. The architecture separates concerns along three axes: presentation (React SPA), business logic and orchestration (Spring Boot backend), and domain computation with AI integration (FastAPI math engine). This separation allows each tier to be developed, tested, and scaled independently, and it reflects the principle that computationally intensive symbolic algebra and LLM API calls should not share resources with the authentication and data persistence layer.

The logical architecture is as follows:

```
Browser → Nginx (:80) ─┬─→ Frontend SPA (:3000 dev)
                        ├─→ Backend API (:8080) → PostgreSQL / Redis / RabbitMQ
                        └─→ Math Engine (:8081) → SymPy / Gemini / Groq
```

In production, Nginx serves the compiled React application as static files and reverse-proxies API requests to the appropriate backend service based on URL prefix: `/api/v1/*` routes to the math engine, and `/api/*` routes to the Spring Boot backend. In development, the Vite development server handles proxying transparently using its built-in proxy configuration.

### 5.2.2 Frontend Architecture

The frontend is a single-page application built with React 18, bundled by Vite, and styled with Tailwind CSS 3. React Router 6 manages client-side navigation with a subject-first URL scheme: `/:subject/:module/calculator` for computation modules, and `/user/*` for authenticated user pages (dashboard, interactive practice, profile, settings).

The application supports five mathematical subjects, each with its own module registry: Discrete Mathematics (7 modules: combinatorics, probability, graph theory, adjacency matrix, set theory, number theory, logic), Linear Algebra (8 modules: vectors, matrices, linear systems, determinants, eigenvalues, linear transformations, vector spaces, orthogonality), Algorithms and Data Structures (8 modules: asymptotic analysis, sorting, searching, graph algorithms, dynamic programming, greedy, divide and conquer, string algorithms), Probability and Statistics (4 modules: probability basics, conditional probability, Bayes' theorem, distributions), and Logic and Computation (5 modules: automata, propositional logic, truth tables, equivalence laws, Boolean algebra). In total, the platform provides 32 interactive calculator modules.

Authentication state is managed through a React Context (AuthContext) that wraps the entire application. Protected routes are enforced by a ProtectedRoute component that redirects unauthenticated users to the sign-in page. API communication is centralized in a single `api.js` module that attaches JWT credentials to all requests.

### 5.2.3 Backend Architecture

The backend is a Spring Boot 3.2.5 application running on Java 21, structured into four bounded contexts following domain-driven design principles:

**Authentication context** (`com.dmc.auth`): Manages user registration, login, JWT token issuance and verification, refresh token rotation with replay attack detection, session management (list, revoke individual, revoke all), password reset with hashed time-limited single-use tokens, and account lockout after configurable failed attempts. Passwords are hashed with BCrypt (cost factor 12). Refresh tokens are SHA-256 hashed before database storage. JWT tokens contain user ID, email, and role claims, signed with an HMAC-SHA secret.

**Learning context** (`com.dmc.learning`): Provides CRUD operations for courses, course modules, and lessons. Write operations (create, update, delete) are restricted to users with ADMIN or TEACHER roles. Read operations are available to all authenticated users. Lesson progress is tracked per user.

**Problem context** (`com.dmc.problem`): The core educational domain. Manages static problems, problem templates (parameterized problem definitions created by teachers), topics (a normalized taxonomy with slugs such as "combinatorics" and "graph-theory"), generated problems (AI or template-generated instances with JSONB snapshots of the generation state), problem attempts, and student skills (BKT mastery model). The ProblemController exposes endpoints for adaptive problem selection (`GET /api/problems/next`), problem generation, answer submission with hybrid verification, and skill queries.

**Calculator gateway context** (`com.dmc.problem` — calculator sub-package): The CalculatorController and CalculatorProxyService implement the API gateway pattern for math engine access. All computation and chat requests from the frontend pass through the backend, which attaches an `X-Internal-Api-Key` header for inter-service authentication before forwarding to the FastAPI math engine. This design ensures that the math engine is not directly accessible to external clients, all computation requests are associated with authenticated users, and calculation history is persisted in the `calc_history` table.

The database schema is managed by Flyway with 14 versioned migrations (V1 through V14), covering: user management (V1), course structure (V2), authentication tokens (V3, V8–V11), problems and attempts (V4), subscriptions (V5), calculation history (V6), chat sessions (V7), teacher roles and topic taxonomy (V12), AI-generated problems (V13), and student skills for BKT (V14).

### 5.2.4 Math Engine Architecture

The math engine is a FastAPI application running on Uvicorn, serving as both a computational backend and an AI integration layer. It exposes 12 domain-specific calculator routers (combinatorics, probability, graph theory, adjacency matrix, set theory, number theory, logic, linear algebra modules, algorithms modules, automata) plus specialized routers for problem generation, problem verification, AI chat, and OCR.

The computational core relies on SymPy for symbolic algebra, NumPy for numerical operations, and NetworkX for graph algorithms. The AI module (`dmc_ai`) integrates Google Gemini as the primary LLM provider with Groq as a fallback. A prototype RAG (Retrieval-Augmented Generation) pipeline provides context-aware responses in the chat interface, though the current index is limited to a small set of hardcoded documents.

The hybrid verification system is the most architecturally significant component of the math engine. When a student submits an answer to a generated problem, the verification endpoint first attempts symbolic verification using SymPy: it evaluates whether `simplify(expected_expression - student_expression) == 0`. If symbolic verification is not possible (e.g., the answer is a textual explanation or a non-algebraic format), the system falls back to semantic verification via Gemini, which returns a correctness judgment, a confidence score (0.0 to 1.0), and textual feedback. If both methods fail, a string comparison fallback is used when the expected answer is known. This layered approach balances mathematical rigor with flexibility for diverse answer formats.

### 5.2.5 Inter-Service Communication

All inter-service communication uses synchronous HTTP/JSON. The backend communicates with the math engine via Java's HttpClient (Java 11+), with configurable connection and read timeouts. The inter-service authentication uses a shared secret key (`X-Internal-Api-Key` header) that the math engine validates on incoming requests when the key is configured to a non-default value.

The infrastructure layer includes PostgreSQL 16 as the primary relational database, Redis 7 (deployed but with integration planned for JWT blacklisting, response caching, and rate limiting), and RabbitMQ 3.13 (deployed as infrastructure for future asynchronous task processing, such as batch AI analysis and collaborative sessions).

---

## 5.3 UML Diagrams

This section presents five UML diagrams that formally model the DMC platform's structure and behavior. All diagrams are authored in PlantUML and stored alongside this chapter in the `diagrams/` directory.

### 5.3.1 Use Case Diagram

*See: `diagrams/use-case.puml` → Figure 5.1*

The Use Case diagram (Figure 5.1) identifies three primary actors—Student, Teacher, and Admin—and one system actor (Math Engine). The Student actor interacts with the platform through eight use cases spanning the complete learning lifecycle: registration and authentication, browsing subject tracks, using calculator modules for direct computation, practicing problems interactively, submitting answers and receiving AI-verified feedback, viewing skill mastery via the BKT dashboard, chatting with the AI tutor, and viewing learning progress. The Teacher actor manages topics and problem templates and creates courses and lessons. The Admin actor manages users, roles, and platform content.

The diagram captures two critical inclusion relationships: Interactive Practice includes Generate AI Problem (every practice session requires problem generation), and Generate AI Problem includes Adaptive Difficulty Selection via BKT (difficulty is automatically determined by the student's mastery state). The Submit Answer use case includes Symbolic Verification (always attempted first) and extends to Semantic Verification (invoked when symbolic methods are insufficient).

### 5.3.2 Sequence Diagram — Solve a Generated Problem

*See: `diagrams/sequence-solve-problem.puml` → Figure 5.2*

The Sequence diagram (Figure 5.2) traces the complete interaction flow for the platform's core educational scenario: a student generating and solving an AI-created problem. The diagram involves five lifelines: Student, React SPA (frontend), Spring Boot (backend), PostgreSQL (database), and FastAPI (math engine), with the Google Gemini API as an external participant.

The flow is divided into two phases. In the Generation phase, the student selects a topic, difficulty, and generation mode. The backend authenticates the request, fetches the student's BKT skill state from the database, and forwards the generation request to the math engine with the internal API key. The math engine either generates the problem via Gemini (AI mode) or fills template parameters and computes the answer via SymPy (Template mode). The generated problem is persisted as a JSONB snapshot in PostgreSQL.

In the Verification phase, the student submits an answer. The backend forwards the answer and expected solution to the math engine's verification endpoint. The math engine attempts symbolic verification with SymPy first; if that fails, it falls back to semantic verification via Gemini. The verification result is returned to the backend, which records the attempt, updates the student's BKT skill state, and returns the result with feedback and the updated mastery level to the frontend.

### 5.3.3 Activity Diagram — Adaptive Learning Flow

*See: `diagrams/activity-learning-flow.puml` → Figure 5.3*

The Activity diagram (Figure 5.3) models the complete adaptive learning loop that the platform implements. The flow begins with student authentication and subject/topic selection, proceeds through BKT-based difficulty recommendation (mapping P(know) to Easy, Medium, or Hard via Zone of Proximal Development thresholds), forks into two generation paths (AI or Template), converges at problem display, branches at the hybrid verification decision point (symbolic → LLM → string fallback), and loops back to difficulty re-evaluation for continued practice. The loop continues until the student explicitly exits to the dashboard.

This activity diagram is particularly significant for the diploma because it demonstrates how the theoretical BKT model (described in Chapter 4) manifests in actual system behavior—the mapping from abstract probability thresholds to concrete difficulty selection is an automated process, not a manual configuration.

### 5.3.4 Component Diagram

*See: `diagrams/component.puml` → Figure 5.4*

The Component diagram (Figure 5.4) decomposes the system into its principal software components and their dependencies. The diagram is organized into five packages: Client Layer (React SPA), API Gateway Layer (Nginx), Backend (seven components: four controllers, three services, and the MathEngineClient), Math Engine (four routers, SymPy core, and dmc_ai module), and Data Layer (PostgreSQL, Redis, RabbitMQ).

Key architectural decisions visible in this diagram include the separation of the BktService from the ProblemService (the BKT algorithm is an independent concern that the problem service invokes but does not implement), the CalculatorProxyService mediating all communication with the math engine through the MathEngineClient (enforcing the gateway pattern), and the dmc_ai module's dual connection to both Google Gemini and Groq APIs (providing LLM provider redundancy).

### 5.3.5 Deployment Diagram

*See: `diagrams/deployment.puml` → Figure 5.5*

The Deployment diagram (Figure 5.5) maps software components to their physical execution environments. All server-side components run as Docker containers orchestrated by Docker Compose on a single host (suitable for the diploma demonstration environment). The diagram shows six containers: Nginx (port 80), Spring Boot backend (port 8080), FastAPI math engine (port 8081), PostgreSQL (port 5432), Redis (port 6379), and RabbitMQ (ports 5672/15672). External cloud dependencies (Google Gemini API and Groq API) are shown as separate cloud nodes.

The production configuration (`docker-compose.prod.yml`) adds security hardening: `security_opt: no-new-privileges`, `cap_drop: ALL`, `read_only` filesystem where possible, resource limits (`mem_limit`, `cpus`), and non-root users in all containers.

---

## 5.4 MVP Scope

### 5.4.1 MoSCoW Prioritization

The MVP scope for the diploma submission was defined using MoSCoW prioritization, balancing the academic requirements of the diploma topic ("Development of a web platform using an AI system for the formation of mathematical skills") with the practical constraints of a single-developer project.

**Must-have (implemented in the diploma version):**

- Multi-subject calculator platform with 32 interactive modules across 5 mathematical subjects (Discrete Mathematics, Linear Algebra, Algorithms, Probability and Statistics, Logic and Computation).
- User authentication with JWT, refresh token rotation, session management, password reset, and account lockout.
- Role-based access control with three roles: Student, Teacher, Admin.
- Course and lesson management (CRUD) for Teachers and Admins.
- Topic taxonomy with normalized slugs for cross-referencing problems, templates, and skills.
- Problem templates: parameterized problem definitions that Teachers create, from which the system generates concrete problem instances with computed answers.
- AI-driven problem generation using Google Gemini, with SymPy-based answer validation.
- Hybrid answer verification: symbolic (SymPy) as the primary path, semantic (Gemini LLM) as the fallback, string comparison as the last resort.
- Bayesian Knowledge Tracing (BKT) for per-topic mastery estimation with adaptive difficulty selection mapped to Zone of Proximal Development thresholds.
- API gateway pattern: all math engine requests proxied through the Spring Boot backend with inter-service authentication (X-Internal-Api-Key).
- AI chatbot for conversational math assistance, proxied through the backend.
- Persistent storage of generated problems (JSONB snapshots), attempts, calculation history, and chat sessions.
- Comprehensive math engine test suite (88 automated tests).
- Database schema evolution via Flyway (14 versioned migrations).

**Should-have (documented as future work):**

- Learning analytics dashboard with mastery progression charts, radar charts, and time-to-mastery predictions.
- Step-by-step solution scaffolding with progressive AI hints (4-level hint system).
- Redis-based JWT blacklisting for immediate session revocation.
- Redis-based response caching for math engine computations.
- Rate limiting on authentication and AI-generation endpoints.
- CSRF protection for cookie-based authentication.
- Frontend end-to-end tests (Playwright or Cypress).

**Could-have (desirable enhancements):**

- Spaced repetition review system using the SM-2 algorithm.
- AI-powered error pattern analysis (misconception detection).
- Real-time collaborative problem solving via WebSocket and RabbitMQ.
- Gamification enhancements: achievements, badges, course completion certificates.
- PDF report generation for learning portfolios.

**Won't-have (excluded from scope):**

- Payment integration (Stripe).
- Mobile native applications.
- Full production Kubernetes deployment.
- Multi-language internationalization (the platform UI is in English only).

### 5.4.2 User Stories (Must-have scope)

The following user stories were implemented in the diploma version:

1. **US-01**: As a student, I want to register and log in so that my progress is saved across sessions.
2. **US-02**: As a student, I want to browse mathematical subjects and their modules so that I can find relevant topics to study.
3. **US-03**: As a student, I want to use interactive calculators for discrete math, linear algebra, algorithms, probability, and logic so that I can verify my manual computations.
4. **US-04**: As a student, I want to practice problems at my skill level so that I am neither bored by trivial exercises nor overwhelmed by impossible ones.
5. **US-05**: As a student, I want the system to generate fresh problems each time so that I cannot memorize answers.
6. **US-06**: As a student, I want my answers verified using both symbolic and AI methods so that the feedback is mathematically rigorous.
7. **US-07**: As a student, I want to see my mastery level per topic so that I know where to focus my study efforts.
8. **US-08**: As a student, I want to chat with an AI tutor about math concepts so that I can get explanations when I am stuck.
9. **US-09**: As a teacher, I want to create problem templates so that the system can generate parameterized problem instances for students.
10. **US-10**: As a teacher, I want to manage topics and categorize problems so that the content is well-organized.
11. **US-11**: As an admin, I want to manage user accounts and roles so that I can grant teacher privileges and moderate the platform.

### 5.4.3 Development Roadmap

The implementation roadmap followed the five-wave structure described in Section 5.1.1. The following table summarizes the deliverables of each wave.

| Wave | Theme | Key Deliverables |
|------|-------|-----------------|
| 1 | Computational Engine | FastAPI math engine with 12 domain routers, SymPy integration, 88 tests, Vite-based React frontend with 32 calculator modules |
| 2 | Backend Foundation | Spring Boot backend, JWT authentication, Flyway migrations (V1–V11), Docker Compose infrastructure, Nginx reverse proxy |
| 3 | Educational Domain | Course/lesson CRUD, TEACHER role, topic taxonomy, problem templates, AI problem generation, hybrid verification, API gateway, inter-service auth (V12–V13) |
| 4 | Adaptive Intelligence | BKT implementation, student_skills table (V14), adaptive difficulty selection, mastery level tracking, Interactive Practice UI |
| 5 | Integration & Defense | Cross-service testing, documentation, architecture review, diploma chapter preparation |

---

## 5.5 Technology Comparison

### 5.5.1 Frontend Framework Comparison

The selection of the frontend framework was evaluated against six criteria relevant to an educational web platform targeting IT students. The table below summarizes the comparison.

| Criterion | React 18 | Vue 3 | Angular 17 |
|-----------|----------|-------|------------|
| **Performance** | Virtual DOM with concurrent features; fast initial render via Vite | Proxy-based reactivity; comparable performance for SPA scale | Zone.js change detection; heavier bundle but optimized with Ivy |
| **Development speed** | High — JSX is intuitive; vast ecosystem of hooks and libraries | High — SFC (Single File Components) with Composition API | Moderate — TypeScript-first; opinionated structure adds boilerplate |
| **Learning curve** | Moderate — requires understanding of hooks, context, and state patterns | Low — gentle learning curve, excellent documentation | High — requires TypeScript, decorators, modules, dependency injection |
| **Community & ecosystem** | Largest: npm downloads ~23M/week; dominant in job market | Growing: ~4M/week; popular in Asia and Europe | Stable: ~3M/week; enterprise-focused |
| **AI/Education suitability** | Excellent — libraries for math rendering (KaTeX, MathJax), chart libraries (Recharts), and real-time UI updates | Good — similar library support, slightly smaller ecosystem | Good — strong for enterprise dashboards, less flexible for rapid prototyping |
| **Scalability** | Component-based architecture scales well; lazy loading via React.lazy | Similar scalability; Pinia state management | Built-in module system for large-scale applications |

**Decision**: React 18 was selected because of its dominant ecosystem (ensuring long-term library support for mathematical rendering and interactive components), the author's prior experience reducing development risk, the availability of Vite as a fast build tool with excellent HMR (Hot Module Replacement) for the iterative development style required by the educational domain, and the prevalence of React skills in the IT labor market relevant to AITU graduates.

### 5.5.2 Backend Framework Comparison

| Criterion | Spring Boot 3 (Java 21) | Django 5 (Python) | Express.js (Node.js) |
|-----------|------------------------|-------------------|---------------------|
| **Performance** | High — JVM with JIT compilation, virtual threads (Project Loom) | Moderate — Python GIL limits CPU-bound concurrency | Moderate — single-threaded event loop; good for I/O, poor for CPU |
| **Development speed** | Moderate — annotation-driven; auto-configuration reduces boilerplate | High — batteries-included (ORM, admin, auth, migrations) | High — minimal boilerplate; flexible but requires manual structuring |
| **Learning curve** | High — Spring ecosystem is vast (Security, Data, Web, etc.) | Moderate — convention over configuration; well-documented | Low — JavaScript throughout; familiar to frontend developers |
| **Security features** | Excellent — Spring Security provides comprehensive auth, CORS, CSRF, method-level authorization out of the box | Good — built-in CSRF, session framework, but JWT requires third-party packages | Basic — requires express-jwt, helmet, passport, and manual configuration |
| **Database integration** | Excellent — JPA/Hibernate with Flyway migrations; type-safe queries | Excellent — Django ORM with built-in migrations | Moderate — Sequelize/TypeORM available but less mature than JPA |
| **AI integration** | Indirect — calls Python services via HTTP | Direct — Python ecosystem (SymPy, ML libraries) natively available | Indirect — calls Python services via HTTP |

**Decision**: Spring Boot 3 with Java 21 was selected because the diploma requires demonstrating enterprise-grade backend engineering practices (dependency injection, type safety, transactional database operations, comprehensive security). The separation of the AI/computation layer into a Python service (FastAPI) allows leveraging the Python ecosystem for SymPy and LLM integration without sacrificing the backend's type safety and security guarantees. This dual-language architecture also demonstrates inter-service communication patterns (API gateway, shared secrets) that are valuable for the diploma defense.

### 5.5.3 AI/Computation Engine Comparison

| Criterion | FastAPI (Python) + SymPy | Flask (Python) + SymPy | Spring Boot + SymJava |
|-----------|-------------------------|----------------------|----------------------|
| **Performance** | Async I/O with Uvicorn; parallel LLM API calls | Synchronous WSGI; requires Gunicorn workers for concurrency | JVM performance but SymJava is far less mature than SymPy |
| **SymPy ecosystem** | Native — SymPy is the de facto standard for Python symbolic math | Native — same SymPy access | Not applicable — no equivalent Java library with SymPy's breadth |
| **LLM integration** | Direct — Google Generative AI SDK, Groq SDK, LangChain all Python-native | Same Python ecosystem | Indirect — requires HTTP calls to Python or JavaScript LLM clients |
| **API documentation** | Auto-generated OpenAPI/Swagger from type hints | Manual or flask-apispec | Spring-native OpenAPI via SpringDoc |
| **Type safety** | Pydantic models with runtime validation | Manual or Marshmallow | Compile-time type checking |

**Decision**: FastAPI was selected as the math engine framework due to the unmatched SymPy ecosystem (the only production-grade computer algebra system freely available), native async support for concurrent LLM API calls, automatic OpenAPI documentation from Pydantic type hints, and the ability to serve as both a computation engine and an AI integration layer. The choice of Python for the computation tier and Java for the orchestration tier reflects a deliberate polyglot architecture that assigns each language to its strength domain.

### 5.5.4 Database Comparison

| Criterion | PostgreSQL 16 | MongoDB 7 | MySQL 8 |
|-----------|--------------|-----------|---------|
| **Relational integrity** | Full ACID compliance, foreign keys, constraints, triggers | Document model; eventual consistency by default; no foreign keys | ACID with InnoDB; foreign keys supported |
| **JSON support** | JSONB with indexing (GIN), JSON path queries, partial indexes | Native — documents are JSON/BSON | JSON type with limited indexing compared to PostgreSQL |
| **Advanced features** | Window functions, CTEs, LATERAL joins, full-text search, pgvector for embeddings | Aggregation pipeline, change streams | Window functions (8.0+), CTEs; fewer advanced analytics features |
| **Migration tooling** | Flyway, Liquibase — mature and well-supported | Schema-less; migrations less critical but tools exist (migrate-mongo) | Flyway, Liquibase — same tooling as PostgreSQL |
| **Suitability for education analytics** | Excellent — window functions enable time-series mastery queries; JSONB stores generated problem snapshots | Good for flexible schemas but lacks relational integrity for grade/attempt tracking | Good but PostgreSQL's analytics features are superior |

**Decision**: PostgreSQL 16 was selected for its combination of strict relational integrity (essential for maintaining consistent student progress, attempt records, and BKT skill states), JSONB support (used to store generated problem snapshots including the AI's generation parameters, expected answer expressions, and verification metadata), and advanced analytical query capabilities (window functions and LATERAL joins planned for the learning analytics dashboard). The pgvector extension also provides a future path for embedding-based RAG without introducing a separate vector database.

### 5.5.5 LLM Provider Comparison

| Criterion | Google Gemini | OpenAI GPT-4 | Groq (Llama 3.3) |
|-----------|--------------|--------------|-------------------|
| **Cost** | Generous free tier; competitive pricing at scale | Higher per-token cost; no free tier for GPT-4 | Free tier with rate limits; fast inference |
| **Math reasoning** | Strong — Gemini 2.0 Flash shows competitive math performance | Excellent — GPT-4 is state-of-the-art for mathematical reasoning | Good — Llama 3.3 70B is competitive but below GPT-4 |
| **Latency** | Low — Flash variant optimized for speed | Moderate — higher latency for GPT-4 | Very low — Groq's custom hardware provides sub-second inference |
| **SDK availability** | Python SDK (google-generativeai); well-documented | Python SDK (openai); extensive documentation | Python SDK (groq); compatible API format |
| **Structured output** | JSON mode with schema enforcement | JSON mode with function calling | JSON mode available |

**Decision**: Google Gemini (specifically Gemini 2.0 Flash) was selected as the primary LLM provider for its balance of cost, latency, and mathematical reasoning capability. Groq (Llama 3.3 70B Versatile) serves as a fallback provider, activated when the Gemini API returns errors or rate-limit responses. This dual-provider strategy ensures high availability of the AI features and demonstrates robust error handling in the diploma defense. OpenAI GPT-4 was considered but rejected due to cost constraints for a student project.

---

## 5.6 Project Mockups

This section describes the principal user interface screens of the DMC platform. Mockup designs were created during the planning phase to guide implementation and were iteratively refined based on user feedback during development sprints. The actual implementation uses Tailwind CSS for a modern, responsive design consistent across all screens.

### 5.6.1 Hub / Landing Page

The Hub page serves as the platform's entry point, presenting the five mathematical subject tracks as interactive cards. Each card displays the subject name, a brief description of its educational goal, the number of available modules, and quick-access buttons for the calculator and roadmap views. The design follows a grid layout that adapts from a single column on mobile to a three-column layout on desktop. A top navigation bar provides access to authentication (Sign In / Sign Up) and, for authenticated users, the user dashboard and profile.

### 5.6.2 Sign In / Sign Up Pages

The authentication screens follow a centered card layout with a clean form design. The Sign In page contains email and password fields with inline validation, a "Forgot password?" link leading to the Reset Password flow, and a link to the Sign Up page. The Sign Up page adds a username field and password confirmation. Both pages display server-side validation errors (e.g., "Email already registered") inline below the relevant field. After successful authentication, the user is redirected to their dashboard.

### 5.6.3 Student Dashboard

The Dashboard provides an overview of the student's learning state. It displays the student's username, XP total, current streak, and account plan. Below the header, subject track cards show the student's progress across mathematical domains. The dashboard is the primary entry point for the Interactive Practice feature, with a prominent "Practice" button linking to the AI-driven problem generation interface.

### 5.6.4 Interactive Practice Page

The Interactive Practice page is the core educational interface. It is divided into three sections. The top section contains controls for selecting a topic (dropdown populated from the topic taxonomy), difficulty level (Easy, Medium, Hard — or "Auto" for BKT-driven selection), and generation mode (AI or Template). A "Generate Problem" button initiates problem generation.

The middle section displays the generated problem: the problem statement (rendered with mathematical notation), an answer input field, and a "Submit" button. After submission, the section expands to show the verification result (correct/incorrect), the verification method used (symbolic, LLM, or fallback), the confidence score for LLM-verified answers, and textual feedback.

The bottom section shows the student's current skill state for the selected topic: the estimated P(know) value, the mastery level label (Novice through Mastered), total and correct attempt counts, and the recommended difficulty for the next problem. A history list shows the student's recent generated problems with their outcomes.

### 5.6.5 Subject Calculator Page

Each subject's calculator page presents the available modules as a grid of interactive cards. Selecting a module opens a dedicated calculator interface with input fields specific to the mathematical domain (e.g., formula input for combinatorics, matrix editor for linear algebra, graph adjacency input for graph theory). Results are displayed with step-by-step explanations where applicable. An AI chatbot panel is accessible from any calculator page via a floating button in the bottom-right corner.

### 5.6.6 Content Administration Page

The Content Admin page is accessible to users with the TEACHER or ADMIN role. It provides interfaces for managing topics (create, edit, delete with slug-based identification), problem templates (parameterized problem definitions with difficulty levels, hints, and answer expressions), courses and lessons (structured educational content with ordering and progress tracking), and user management (role assignment, account status).

---

## 5.7 Chapter Summary

This chapter has presented the complete methodological and design foundation of the DMC platform. The development followed an Agile/Scrum-inspired iterative approach organized into five waves, with each wave delivering a demonstrable increment reviewed against acceptance criteria. The system architecture employs a three-tier pattern with a deliberate polyglot design: React for the presentation layer, Spring Boot for business logic and security, and FastAPI with SymPy for computation and AI integration.

Five UML diagrams formally model the system: a Use Case diagram identifying the three actor roles and their interactions, a Sequence diagram tracing the complete problem-solve flow through all system tiers, an Activity diagram capturing the adaptive learning loop driven by BKT, a Component diagram decomposing the system into its principal software modules and dependencies, and a Deployment diagram mapping components to their Docker container execution environments.

The MVP scope was defined using MoSCoW prioritization, resulting in 14 Must-have features for the diploma submission and a documented backlog of Should-have, Could-have, and Won't-have features for future development. The technology stack was selected through systematic comparison against criteria of performance, development speed, learning curve, ecosystem support, AI integration capability, and cost, with explicit rationale provided for each selection decision.

The mockup descriptions in Section 5.6 document the six principal UI screens that constitute the student and teacher experience. These screens—Hub, Authentication, Dashboard, Interactive Practice, Subject Calculator, and Content Administration—collectively support all eleven user stories defined in the MVP scope.

The next chapter presents the implementation details of the platform's core AI features: the hybrid verification system and the Bayesian Knowledge Tracing engine.
