# 09 - Debugging Runbook

Triage guide for Henshin failures.

## 1. "EPackage not found" or "nsURI not registered"
-   **Cause**: Henshin can't find your metamodel.
-   **Fix**: Check the `imports` tag in the `.henshin` file. Ensure the `nsURI` matches the Ecore file.

## 2. NullPointerException during matching
-   **Cause**: Often a broken reference in the XMI (e.g., a node type points to a non-existent class).
-   **Fix**: Run Tier 1 validation. Re-save the `.henshin` file in an editor to refresh references.

## 3. Rule is never applied
-   **Cause**: The LHS/NAC is too restrictive, or parameters are not being provided correctly.
-   **Fix**:
    -   Check if the test model actually contains the pattern.
    -   Try removing NACs one by one.
    -   Check if `IN` parameters are being bound.

## 4. VAR parameter is null
-   **Cause**: In a `SequentialUnit`, a prior step failed to set the `OUT` parameter that feeds the `VAR`.
-   **Fix**: Ensure the providing rule actually executes and has a mapping/attribute that sets the parameter.

## 5. "Inconsistent state" after rule application
-   **Cause**: Rule violates metamodel constraints (e.g., duplicate unique IDs, broken multiplicity).
-   **Fix**: Inspect the model after applying the rule using the CLI validator's `--apply` mode.

## 6. NullPointerException when modifying bi-directional opposites
-   **Cause**: Attempting to set bi-directional references in rule RHS where the source is a newly created node. Henshin's automatically generated opposite change resolves the source as null before it is fully instantiated.
-   **Fix**: Route reference changes to start from matched, preserved nodes (e.g., set single-valued opposites from preserved target nodes to the new node), ensuring the reference source is never null.

## 7. Mismatched edge-to-node XML attributes
-   **Cause**: An edge is defined in the rule XML, but the source node lacks `outgoing="edgeId"` or the target node lacks `incoming="edgeId"` (or vice-versa).
-   **Fix**: Verify all rule edges have corresponding matching references in the nodes' `incoming`/`outgoing` attribute lists.

## 8. "The feature ... is not a valid feature" (Package Identity Mismatch)
-   **Cause**: When dry-run applying a rule, EMF loads the metamodel once to parse Henshin rules (Package Instance #1) and a second time when parsing the XMI model via its inline `xsi:schemaLocation="... cra.ecore"` (Package Instance #2). When Henshin queries a bidirectional opposite feature on a model candidate, EMF checks if the queried feature object is the exact same in-memory object as the registered structural feature, throwing an `IllegalArgumentException` if they come from different EPackage instances.
-   **Fix**: 
    1. Configure the validator's ResourceSet to ignore XML schema locations via `XMLResource.OPTION_SCHEMA_LOCATION = Boolean.FALSE`.
    2. Register the loaded EPackage globally across all potential namespace URIs and absolute/relative physical file paths in the package registry, allowing EMF to reuse the in-memory package instance instead of parsing it a second time.
    3. Invoke `EcoreUtil.resolveAll(resSet)` on the ResourceSet prior to rule application to force resolving all lazy proxies.

