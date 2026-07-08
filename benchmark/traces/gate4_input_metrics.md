# Gate 4 Input Specification: MOMoT Search Script Configuration & OCL Metrics
## Input Text Received by MOMoT Agent

This document represents the raw mathematical formulations and NSGA-II parameters provided to the MOMoT Agent to synthesize `cra_solve.momot`.

---

### 1. Mathematical Formulas

#### A. Class Cohesion
$$Cohesion(c) = \begin{cases} 
0 & \text{if } |F_c| \le 1 \\
\frac{ \sum_{m \in M_c} |\{ a \in A_c \mid m \text{ accesses } a \}| + \sum_{m_1 \in M_c} |\{ m_2 \in M_c \setminus \{m_1\} \mid m_1 \text{ calls } m_2 \}| }{|F_c| \times (|F_c| - 1)} & \text{if } |F_c| > 1 
\end{cases}$$

#### B. Class Coupling
$$Coupling(c_1, c_2) = \begin{cases} 
0 & \text{if } |F_{c_1}| = 0 \text{ or } |F_{c_2}| = 0 \\
\frac{ \sum_{m \in M_{c_1}} |\{ a \in A_{c_2} \mid m \text{ accesses } a \}| + \sum_{m_1 \in M_{c_1}} |\{ m_2 \in M_{c_2} \mid m_1 \text{ calls } m_2 \}| }{|F_{c_1}| \times |F_{c_2}|}
\end{cases}$$

#### C. CRA Index (Global Objective)
$$CRA\_Index(C) = \sum_{c \in C} \left( Cohesion(c) - \sum_{other \in C \setminus \{c\}} Coupling(c, other) \right)$$

---

### 2. Hyperparameter Constraints & Setup

*   **Search Engine:** MOEA Framework integrated into MOMoT via NSGA-II.
*   **Population Size:** `200` chromosomes.
*   **Max Evaluations:** `50,000` evaluations.
*   **Solution Horizon (Solution sequence length):** `12` operations.
*   **Objective 1 (CRA Index):** Maximize the global CRA Index (using additive co-constraint penalties of `-10.0` for any empty class or unassigned feature to keep assignments complete).
*   **Objective 2 (Solution Length):** Minimize the number of applied rules.
