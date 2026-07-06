# T05: Vehicle Routing "From Scratch" Test Case

This test case verifies the full MOMoT Smart Agent pipeline from a plain-English problem description.

## Test Procedure

1. Read the problem description in `PROBLEM.md`.
2. Invoke the Coordinator Agent (`agents/prompts/coordinator.prompt.md`).
3. Confirm that the Artifact Detector schedules all 4 files for generation.
4. Step through each generator: Ecore, XMI, Henshin, and MOMoT.
5. Verify that each generated file passes its validation checks (Tier 1).
6. Package the generated artifacts and run on the Docker headless runner (Tier 2).
7. Inspect the resulting Pareto front (`overall_objectives.pf`) and verify it ε-dominates the reference front in `expected/pareto-front.json`.
