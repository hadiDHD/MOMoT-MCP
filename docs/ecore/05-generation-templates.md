# Ecore Wiki — Chapter 05: Four Canonical Ecore Templates

This chapter provides complete, copy-pasteable Ecore XML templates for the four most common architectural shapes used in modeling search spaces: the linear chain, the hierarchical tree, the bipartite graph, and the centralized registry.

---

## 1. Linear Chain Template

Use this template when you have a container that holds a set of stacks, lists, or chains, where elements are stored in a strict, ordered sequence (such as the Stack Load Balancing problem).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="stack"
    nsURI="http://at.ac.tuwien.big.momot/examples/stack/1.0"
    nsPrefix="stack">
  <eClassifiers xsi:type="ecore:EClass" name="StackModel">
    <eStructuralFeatures xsi:type="ecore:EReference" name="stacks" upperBound="-1"
        eType="#//Stack" containment="true"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Stack">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="id"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EReference" name="elements" upperBound="-1"
        eType="#//Element" containment="true" eOpposite="#//Element/stack"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Element">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="value"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EInt"/>
    <eStructuralFeatures xsi:type="ecore:EReference" name="stack" upperBound="1"
        eType="#//Stack" containment="false" eOpposite="#//Stack/elements"/>
  </eClassifiers>
</ecore:EPackage>
```

---

## 2. Hierarchical Tree Template

Use this template when modeling recursive structures, directories, organizational structures, or general trees where nodes can contain other nodes of the same type.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="tree"
    nsURI="http://at.ac.tuwien.big.momot/examples/tree/1.0"
    nsPrefix="tree">
  <eClassifiers xsi:type="ecore:EClass" name="TreeModel">
    <eStructuralFeatures xsi:type="ecore:EReference" name="rootNode" lowerBound="1"
        eType="#//Node" containment="true"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Node">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="name"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EReference" name="parent" upperBound="1"
        eType="#//Node" containment="false" eOpposite="#//Node/children"/>
    <eStructuralFeatures xsi:type="ecore:EReference" name="children" upperBound="-1"
        eType="#//Node" containment="true" eOpposite="#//Node/parent"/>
  </eClassifiers>
</ecore:EPackage>
```

---

## 3. Bipartite Graph (Assignment) Template

Use this template when modeling allocation and scheduling problems, where objects of one type are assigned or mapped to objects of another type (such as Task-Machine Scheduling).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="scheduling"
    nsURI="http://at.ac.tuwien.big.momot/examples/scheduling/1.0"
    nsPrefix="scheduling">
  <eClassifiers xsi:type="ecore:EClass" name="Schedule">
    <eStructuralFeatures xsi:type="ecore:EReference" name="tasks" upperBound="-1"
        eType="#//Task" containment="true"/>
    <eStructuralFeatures xsi:type="ecore:EReference" name="machines" upperBound="-1"
        eType="#//Machine" containment="true"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Task">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="name"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="duration"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EInt"/>
    <eStructuralFeatures xsi:type="ecore:EReference" name="assignedTo" upperBound="1"
        eType="#//Machine" containment="false" eOpposite="#//Machine/tasks"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Machine">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="name"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EReference" name="tasks" upperBound="-1"
        eType="#//Task" containment="false" eOpposite="#//Task/assignedTo"/>
  </eClassifiers>
</ecore:EPackage>
```

---

## 4. Centralized Registry Template

Use this template when you need an item collection index, where items are flat elements containing basic features and unique string-based lookup IDs.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="registry"
    nsURI="http://at.ac.tuwien.big.momot/examples/registry/1.0"
    nsPrefix="registry">
  <eClassifiers xsi:type="ecore:EClass" name="Registry">
    <eStructuralFeatures xsi:type="ecore:EReference" name="items" upperBound="-1"
        eType="#//Item" containment="true"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Item">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="itemId"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="value"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EInt"/>
  </eClassifiers>
</ecore:EPackage>
```
