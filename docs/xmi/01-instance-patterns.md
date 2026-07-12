# XMI Wiki — Chapter 01: Instance Patterns

This chapter illustrates how to instantiate the four canonical Ecore shapes defined in `docs/ecore/05`. It also details the design requirements for creating high-quality, solvable, yet sufficiently challenging initial states for multi-objective search algorithms.

---

## 1. Linear Chain Pattern (Stack Load Balancing)

In this pattern, the root class contains stacks, which in turn contain elements. Order is implied by the document nesting structure.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<stack:StackModel xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:stack="http://at.ac.tuwien.big.momot/examples/stack/1.0"
    xsi:schemaLocation="http://at.ac.tuwien.big.momot/examples/stack/1.0 ../../model/stack.ecore">
  <stacks xmi:id="_stack0">
    <elements xmi:id="_el0" value="10"/>
    <elements xmi:id="_el1" value="20"/>
    <elements xmi:id="_el2" value="30"/>
  </stacks>
  <stacks xmi:id="_stack1"/>
</stack:StackModel>
```

---

## 2. Hierarchical Tree Pattern

A recursive pattern where nodes contain nested child nodes.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tree:TreeModel xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:tree="http://at.ac.tuwien.big.momot/examples/tree/1.0"
    xsi:schemaLocation="http://at.ac.tuwien.big.momot/examples/tree/1.0 ../../model/tree.ecore">
  <rootNode xmi:id="_root" name="root">
    <children xmi:id="_child1" name="Child 1">
      <children xmi:id="_grandchild1" name="Grandchild 1"/>
    </children>
    <children xmi:id="_child2" name="Child 2"/>
  </rootNode>
</tree:TreeModel>
```

---

## 3. Bipartite Graph Pattern (Task-Machine Scheduling)

This pattern represents tasks and machines at root-level containment. Task allocation to machines is represented via cross-references.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<scheduling:Schedule xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:scheduling="http://at.ac.tuwien.big.momot/examples/scheduling/1.0"
    xsi:schemaLocation="http://at.ac.tuwien.big.momot/examples/scheduling/1.0 ../../model/scheduling.ecore">
  <tasks xmi:id="_task1" name="Task 1" duration="5" assignedTo="_machine1"/>
  <tasks xmi:id="_task2" name="Task 2" duration="10" assignedTo="_machine1"/>
  <machines xmi:id="_machine1" name="Machine 1" tasks="_task1 _task2"/>
  <machines xmi:id="_machine2" name="Machine 2"/>
</scheduling:Schedule>
```

---

## 4. Registry Pattern

Flat items contained in a centralized registry.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<registry:Registry xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:registry="http://at.ac.tuwien.big.momot/examples/registry/1.0"
    xsi:schemaLocation="http://at.ac.tuwien.big.momot/examples/registry/1.0 ../../model/registry.ecore">
  <items xmi:id="_item1" itemId="itm1" value="100"/>
  <items xmi:id="_item2" itemId="itm2" value="200"/>
</registry:Registry>
```

---

## Search Sizing and "Bad Start" Requirements

To allow the evolutionary algorithms to perform optimization:
- **Instance Sizing**: The instance should contain **at least 5 primary objects** (e.g., 5 tasks, 5 stacks) to ensure search space diversity.
- **The Maximally Imbalanced Rule**: For optimization (minimization/maximization) problems, initial states must be constructed in a **maximally bad configuration** to establish a high baseline.
  - In task scheduling, assign all tasks to a single machine.
  - In stack load balancing, put all elements on one stack.
  - This guarantees that the initial objective evaluations represent worst-case scenarios, giving the algorithms clear progress indicators as they move, assign, or mutate elements.

## Verification Checklist

- [ ] Instance size has at least 5 primary entities.
- [ ] Initial state represents a worst-case baseline (maximally imbalanced).
- [ ] All nested elements are correctly contained.
- [ ] Multi-valued assignments are separated by spaces (e.g., `tasks="_task1 _task2"`).
