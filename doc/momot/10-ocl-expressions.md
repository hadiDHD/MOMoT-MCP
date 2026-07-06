# MOMoT Wiki — Chapter 10: 20 Worked OCL Objective Examples

This chapter provides a rich reference library of 20 worked OCL (Object Constraint Language) objective expressions across five common problem classes. Writing real, robust OCL expressions avoids the need for placeholder `{ 0.0 }` objectives and ensures your evolutionary search has meaningful gradients to guide optimization.

---

## OCL Pattern Rules

When writing fitness objectives in MOMoT:
1. **Model Root Context**: Every OCL string is evaluated starting from the **model root element** (the single containment root class in your Ecore, such as `StackModel` or `Schedule`).
2. **Operations and Aggregations**: Use standard collection operators:
   - `->collect(expr)`: Projects properties into a new collection.
   - `->select(expr)`: Filters elements based on a boolean condition.
   - `->size()`: Counts collection size.
   - `->sum()` / `->max()` / `->min()`: Standard mathematical aggregations.
3. **Double Coercion**: All objectives must return a numeric value (implicitly coerced to a Java `double`).

---

## The 20 Worked OCL Expressions

### Class 1: Load Balancing / Bin Packing

1. **Load Range Range (Min-Max Spacing)**
   `"stacks.load->max() - stacks.load->min()"`
2. **Average Weight of Containers**
   `"containers->collect(c | c.weight)->sum() / containers->size()"`
3. **Standard Deviation Proxy (Variance sum)**
   `"containers->collect(c | (c.weight - 10.0) * (c.weight - 10.0))->sum()"`
4. **Number of Overloaded Bins**
   `"bins->select(b | b.currentWeight > b.maxCapacity)->size()"`

### Class 2: Tree Structure Optimization

5. **Maximum Tree Depth**
   `"nodes->select(n | n.children->isEmpty())->collect(n | n.depth)->max()"`
6. **Total Leaf Count**
   `"nodes->select(n | n.children->isEmpty())->size()"`
7. **Number of Unbalanced Branch Nodes**
   `"nodes->select(n | n.left.height - n.right.height > 1 or n.right.height - n.left.height > 1)->size()"`
8. **Average Branching Factor**
   `"nodes->collect(n | n.children->size())->sum() / nodes->size()"`

### Class 3: Task / Resource Scheduling

9. **Makespan (Max Machine Duration)**
   `"machines->collect(m | tasks->select(t | t.assignedTo = m).duration->sum())->max()"`
10. **Number of Active (Used) Machines**
    `"machines->select(m | tasks->exists(t | t.assignedTo = m))->size()"`
11. **Total Overdue Task Penalties**
    `"tasks->select(t | t.endTime > t.deadline)->collect(t | (t.endTime - t.deadline) * t.penaltyRate)->sum()"`
12. **Machine Idle Time Minimization**
    `"machines->collect(m | 100 - tasks->select(t | t.assignedTo = m).duration->sum())->sum()"`

### Class 4: Graph / Network Flow

13. **Maximum Node Degree**
    `"nodes->collect(n | n.edges->size())->max()"`
14. **Total Edge Length (Routing distance)**
    `"edges->collect(e | e.distance)->sum()"`
15. **Unreachable Node Count**
    `"nodes->select(n | n.isReached = false)->size()"`
16. **Total Network Congestion Proxy**
    `"nodes->collect(n | n.incomingFlow)->max()"`

### Class 5: Class-Responsibility Assignment (CRA)

The CRA problem optimizes cohesion and coupling. These expressions are polymorphic and navigate multi-typed structural features.

17. **CRA Coupling Minimization (Multi-class association count)**
    `"classes->collect(c | c.features->select(f | f.oclIsKindOf(Method))->collect(f | f.oclAsType(Method).calledMethods.assignedTo)->reject(target | target = c)->size())->sum()"`
18. **Total Attribute Cohesion Maximization**
    `"classes->collect(c | c.features->select(f | f.oclIsKindOf(Attribute))->size())->sum()"`
19. **Empty Class Penalty**
    `"classes->select(c | c.features->isEmpty())->size() * 100.0"`
20. **Single Feature Class Count**
    `"classes->select(c | c.features->size() = 1)->size()"`

## Verification Checklist

- [ ] All expressions evaluate from the root class of the metamodel.
- [ ] No placeholder `{ 0.0 }` expressions are used in production scripts.
- [ ] Attribute and reference names match the `.ecore` case-sensitively.
- [ ] Cast operations for polymorphic types use `oclIsKindOf` and `oclAsType`.
