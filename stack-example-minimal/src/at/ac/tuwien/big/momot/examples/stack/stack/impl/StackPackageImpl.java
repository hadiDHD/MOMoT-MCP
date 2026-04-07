/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack.impl;

import at.ac.tuwien.big.momot.examples.stack.stack.Stack;
import at.ac.tuwien.big.momot.examples.stack.stack.StackFactory;
import at.ac.tuwien.big.momot.examples.stack.stack.StackModel;
import at.ac.tuwien.big.momot.examples.stack.stack.StackPackage;

import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EReference;
import org.eclipse.emf.ecore.impl.EPackageImpl;

/**
 * @generated
 */
public class StackPackageImpl extends EPackageImpl implements StackPackage {
   private static boolean isInited = false;

   public static StackPackage init() {
      if(isInited) {
         return (StackPackage) EPackage.Registry.INSTANCE.getEPackage(StackPackage.eNS_URI);
      }

      final StackPackageImpl theStackPackage = (StackPackageImpl) (EPackage.Registry.INSTANCE
            .get(eNS_URI) instanceof StackPackageImpl ? EPackage.Registry.INSTANCE.get(eNS_URI)
                  : new StackPackageImpl());

      isInited = true;

      theStackPackage.createPackageContents();
      theStackPackage.initializePackageContents();
      theStackPackage.freeze();

      EPackage.Registry.INSTANCE.put(StackPackage.eNS_URI, theStackPackage);
      return theStackPackage;
   }

   private EClass stackModelEClass = null;
   private EClass stackEClass = null;

   private boolean isCreated = false;
   private boolean isInitialized = false;

   private StackPackageImpl() {
      super(eNS_URI, StackFactory.eINSTANCE);
   }

   @Override
   public EClass getStackModel() {
      return stackModelEClass;
   }

   @Override
   public EReference getStackModel_Stacks() {
      return (EReference) stackModelEClass.getEStructuralFeatures().get(0);
   }

   @Override
   public EClass getStack() {
      return stackEClass;
   }

   @Override
   public EAttribute getStack_Id() {
      return (EAttribute) stackEClass.getEStructuralFeatures().get(0);
   }

   @Override
   public EAttribute getStack_Load() {
      return (EAttribute) stackEClass.getEStructuralFeatures().get(1);
   }

   @Override
   public EReference getStack_Left() {
      return (EReference) stackEClass.getEStructuralFeatures().get(2);
   }

   @Override
   public EReference getStack_Right() {
      return (EReference) stackEClass.getEStructuralFeatures().get(3);
   }

   @Override
   public StackFactory getStackFactory() {
      return (StackFactory) getEFactoryInstance();
   }

   public void createPackageContents() {
      if(isCreated) {
         return;
      }
      isCreated = true;

      stackModelEClass = createEClass(STACK_MODEL);
      createEReference(stackModelEClass, STACK_MODEL__STACKS);

      stackEClass = createEClass(STACK);
      createEAttribute(stackEClass, STACK__ID);
      createEAttribute(stackEClass, STACK__LOAD);
      createEReference(stackEClass, STACK__LEFT);
      createEReference(stackEClass, STACK__RIGHT);
   }

   public void initializePackageContents() {
      if(isInitialized) {
         return;
      }
      isInitialized = true;

      setName(eNAME);
      setNsPrefix(eNS_PREFIX);
      setNsURI(eNS_URI);

      initEClass(stackModelEClass, StackModel.class, "StackModel", !IS_ABSTRACT, !IS_INTERFACE,
            IS_GENERATED_INSTANCE_CLASS);
      initEReference(getStackModel_Stacks(), this.getStack(), null, "stacks", null, 0, -1, StackModel.class,
            !IS_TRANSIENT, !IS_VOLATILE, IS_CHANGEABLE, IS_COMPOSITE, !IS_RESOLVE_PROXIES, !IS_UNSETTABLE, IS_UNIQUE,
            !IS_DERIVED, IS_ORDERED);

      initEClass(stackEClass, Stack.class, "Stack", !IS_ABSTRACT, !IS_INTERFACE, IS_GENERATED_INSTANCE_CLASS);
      initEAttribute(getStack_Id(), ecorePackage.getEString(), "id", null, 1, 1, Stack.class, !IS_TRANSIENT,
            !IS_VOLATILE, IS_CHANGEABLE, !IS_UNSETTABLE, !IS_ID, IS_UNIQUE, !IS_DERIVED, IS_ORDERED);
      initEAttribute(getStack_Load(), ecorePackage.getEInt(), "load", null, 1, 1, Stack.class, !IS_TRANSIENT,
            !IS_VOLATILE, IS_CHANGEABLE, !IS_UNSETTABLE, !IS_ID, IS_UNIQUE, !IS_DERIVED, IS_ORDERED);
      initEReference(getStack_Left(), this.getStack(), this.getStack_Right(), "left", null, 1, 1, Stack.class,
            !IS_TRANSIENT, !IS_VOLATILE, IS_CHANGEABLE, !IS_COMPOSITE, IS_RESOLVE_PROXIES, !IS_UNSETTABLE, IS_UNIQUE,
            !IS_DERIVED, IS_ORDERED);
      initEReference(getStack_Right(), this.getStack(), this.getStack_Left(), "right", null, 1, 1, Stack.class,
            !IS_TRANSIENT, !IS_VOLATILE, IS_CHANGEABLE, !IS_COMPOSITE, IS_RESOLVE_PROXIES, !IS_UNSETTABLE, IS_UNIQUE,
            !IS_DERIVED, IS_ORDERED);

      createResource(eNS_URI);
   }
}

