# Feature 1: BKT-based Adaptive Difficulty

## Sprint Overview

This document describes the implementation of **Bayesian Knowledge Tracing (BKT)** for adaptive difficulty selection in the DMC (Discrete Math Calculator) platform. BKT is a Hidden Markov Model used to estimate a student's latent knowledge state from their observable performance on problems.

---

## 1. Theoretical Foundation

### 1.1 Bayesian Knowledge Tracing (Corbett & Anderson, 1994)

BKT models student knowledge as a **binary latent variable** — a student either *knows* or *does not know* a given skill/topic at any point in time. The model uses four parameters:

| Parameter | Symbol | Default | Description |
|-----------|--------|---------|-------------|
| **P(L₀)** — Initial knowledge | `p_know` | 0.25 | Prior probability that the student already knows the skill before any practice |
| **P(G)** — Guess | `p_guess` | 0.20 | Probability of answering correctly despite NOT knowing the skill |
| **P(S)** — Slip | `p_slip` | 0.10 | Probability of answering incorrectly despite knowing the skill |
| **P(T)** — Transit | `p_transit` | 0.10 | Probability of transitioning from "not known" to "known" after each practice opportunity |

### 1.2 Update Formulas

After each student response (observation), BKT performs a two-step update:

#### Step 1: Posterior Update (Bayes' Rule)

Given the student's current estimated mastery P(Lₙ), we update based on whether the answer was correct or incorrect:

**If the answer is correct:**

$$P(L_n | \text{correct}) = \frac{P(L_n) \cdot (1 - P(S))}{P(L_n) \cdot (1 - P(S)) + (1 - P(L_n)) \cdot P(G)}$$

**If the answer is incorrect:**

$$P(L_n | \text{incorrect}) = \frac{P(L_n) \cdot P(S)}{P(L_n) \cdot P(S) + (1 - P(L_n)) \cdot (1 - P(G))}$$

#### Step 2: Learning Transition

After the posterior update, we account for the possibility that the student learned the skill during this practice opportunity:

$$P(L_{n+1}) = P(L_n | \text{obs}) + (1 - P(L_n | \text{obs})) \cdot P(T)$$

### 1.3 Intuitive Explanation

- **Correct answer** → increases our belief that the student knows the skill (posterior goes up)
- **Incorrect answer** → decreases our belief (posterior goes down, but tempered by the slip probability)
- **Learning transition** → after every attempt, there is a small chance the student learned the skill, so P(know) can only increase or stay the same after this step

### 1.4 Zone of Proximal Development (ZPD) Mapping

The estimated P(know) is mapped to a recommended difficulty level, implementing Vygotsky's Zone of Proximal Development:

| P(know) Range | Difficulty | Rationale |
|---------------|-----------|-----------|
| P(know) < 0.4 | **EASY** | Student is still learning fundamentals — reinforce with simpler problems |
| 0.4 ≤ P(know) < 0.7 | **MEDIUM** | Student is in the ZPD — challenge with moderate problems for optimal learning |
| P(know) ≥ 0.7 | **HARD** | Student has strong mastery — push with difficult problems to deepen understanding |

---

## 2. Implementation Details

### 2.1 Database Schema

**Table: `student_skills`** (Flyway migration `V14__create_student_skills.sql`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | `BIGSERIAL` | Primary key |
| `user_id` | `BIGINT FK` | References `users(id)` |
| `topic_slug` | `VARCHAR(120)` | Topic identifier (e.g., `combinatorics`, `graph-theory`) |
| `p_know` | `DOUBLE PRECISION` | Current estimated mastery probability (BKT P(L)) |
| `p_guess` | `DOUBLE PRECISION` | Guess parameter P(G) |
| `p_slip` | `DOUBLE PRECISION` | Slip parameter P(S) |
| `p_transit` | `DOUBLE PRECISION` | Transit/learning parameter P(T) |
| `total_attempts` | `INTEGER` | Count of all attempts on this topic |
| `correct_attempts` | `INTEGER` | Count of correct attempts |
| `created_at` | `TIMESTAMPTZ` | Record creation time |
| `updated_at` | `TIMESTAMPTZ` | Last update time (auto-trigger) |

**Unique constraint:** `(user_id, topic_slug)` per active (non-deleted) record.

### 2.2 Java Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| `StudentSkill` | `com.dmc.problem.entity` | JPA entity mapped to `student_skills` table |
| `StudentSkillRepository` | `com.dmc.problem.repository` | Spring Data JPA repository for CRUD operations |
| `BktService` | `com.dmc.problem.service` | Core BKT update logic — performs Bayesian posterior + learning transition |
| `ProblemService` | `com.dmc.problem.service` | Integrates BKT into attempt submission; provides adaptive next-problem logic |
| `ProblemController` | `com.dmc.problem.controller` | REST endpoints for adaptive problem selection and skill queries |

### 2.3 BKT Service (`BktService.java`)

The service exposes two public methods:

1. **`updateSkill(User, topicSlug, isCorrect)`** — Called after every problem attempt. Finds or creates the student's skill record, applies the BKT update formulas, and persists the new P(know).

2. **`getOrCreateSkill(User, topicSlug)`** — Retrieves the student's current skill state, creating a default record (P(L₀)=0.25) if none exists.

### 2.4 Integration Points

BKT updates are triggered in two places:

1. **Static problem attempts** (`ProblemService.submitAttempt`) — Updates skill based on the problem's `topic` field
2. **Generated problem attempts** (`ProblemService.submitGeneratedAttempt`) — Updates skill based on the generated problem's `topicSlug`

### 2.5 Mastery Levels

For display purposes, P(know) is mapped to human-readable labels:

| P(know) Range | Label |
|---------------|-------|
| < 0.30 | NOVICE |
| 0.30 – 0.49 | BEGINNER |
| 0.50 – 0.69 | INTERMEDIATE |
| 0.70 – 0.89 | ADVANCED |
| ≥ 0.90 | MASTERED |

---

## 3. API Endpoints

### 3.1 Get Next Adaptive Problem

```
GET /api/problems/next?topic={topicSlug}&mode={TEMPLATE|AI}
```

**Logic:**
1. Fetch (or create) the user's `StudentSkill` for the given topic
2. Map P(know) to a difficulty level using the ZPD thresholds
3. Generate a new problem at the recommended difficulty
4. Return the problem along with the current skill state

**Response:**
```json
{
  "problem": { ... },
  "skill": {
    "id": 1,
    "topicSlug": "combinatorics",
    "pKnow": 0.42,
    "pGuess": 0.20,
    "pSlip": 0.10,
    "pTransit": 0.10,
    "totalAttempts": 5,
    "correctAttempts": 3,
    "masteryLevel": "BEGINNER",
    "updatedAt": "2026-03-24T12:00:00Z"
  },
  "recommendedDifficulty": "MEDIUM"
}
```

### 3.2 Get All Student Skills

```
GET /api/problems/skills/me
```

Returns an array of `StudentSkillDto` for all topics the student has attempted.

### 3.3 Get Skill for Specific Topic

```
GET /api/problems/skills/me/{topicSlug}
```

Returns the `StudentSkillDto` for a specific topic.

---

## 4. Numerical Example

Starting state: `p_know = 0.25`, `p_guess = 0.20`, `p_slip = 0.10`

**After a correct answer:**
```
p_know_obs = (0.25 × 0.90) / (0.25 × 0.90 + 0.75 × 0.20)
           = 0.225 / (0.225 + 0.150)
           = 0.225 / 0.375
           = 0.600

p_know_new = 0.600 + (1 - 0.600) × 0.10
           = 0.600 + 0.040
           = 0.640
```
→ Difficulty recommendation changes from EASY to **MEDIUM** (P(know) ≥ 0.4)

**After an incorrect answer (from 0.640):**
```
p_know_obs = (0.640 × 0.10) / (0.640 × 0.10 + 0.360 × 0.80)
           = 0.064 / (0.064 + 0.288)
           = 0.064 / 0.352
           = 0.1818

p_know_new = 0.1818 + (1 - 0.1818) × 0.10
           = 0.1818 + 0.0818
           = 0.2636
```
→ Difficulty recommendation drops back to **EASY** (P(know) < 0.4)

---

## 5. Design Decisions

1. **Per-topic tracking** — Each topic has independent BKT parameters, allowing fine-grained mastery estimation across discrete math domains.

2. **Default parameter values** — We use conservative defaults from the BKT literature: P(L₀)=0.25, P(G)=0.20, P(S)=0.10, P(T)=0.10. These can be tuned per-topic in the future.

3. **No forgetting model** — The current implementation does not model skill decay over time. P(know) can only decrease through incorrect answers, not through inactivity. This is a simplification aligned with the classic BKT model.

4. **Clamping** — P(know) is clamped to [0.0, 1.0] as a safety measure against floating-point edge cases.

5. **Lazy initialization** — Student skill records are created on first interaction with a topic, avoiding the need for pre-population.

---

## 6. Future Enhancements

- **Parameter fitting** — Use EM algorithm to fit P(G), P(S), P(T) from historical data per topic
- **Forgetting factor** — Add time-decay to model skill atrophy during inactivity
- **Multi-skill problems** — Allow problems to map to multiple skills with weighted BKT updates
- **Individualized parameters** — Use hierarchical Bayesian models to personalize P(G), P(S), P(T) per student
- **Dashboard visualization** — Plot P(know) trajectories over time per topic

---

## 7. References

1. Corbett, A. T., & Anderson, J. R. (1994). *Knowledge tracing: Modeling the acquisition of procedural knowledge.* User Modeling and User-Adapted Interaction, 4(4), 253–278.
2. Baker, R. S., Corbett, A. T., & Aleven, V. (2008). *More accurate student modeling through contextual estimation of slip and guess probabilities in Bayesian Knowledge Tracing.* Proceedings of ITS 2008.
3. Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes.* Harvard University Press.
