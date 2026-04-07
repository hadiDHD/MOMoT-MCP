/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack;

import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EReference;

/**
 * <!-- begin-user-doc -->
 * The <b>Package</b> for the model.
 * It contains accessors for the meta objects to represent
 * <ul>
 * <li>each class,</li>
 * <li>each feature of each class,</li>
 * <li>each operation of each class,</li>
 * <li>each enum,</li>
 * <li>and each data type</li>
 * </ul>
 * <!-- end-user-doc -->
 * 
 * @see at.ac.tuwien.big.momot.examples.stack.stack.StackFactory
 * @model kind="package"
 * @generated
 */
public interface StackPackage extends EPackage {
   interface Literals {
      EClass STACK_MODEL = eINSTANCE.getStackModel();
      EReference STACK_MODEL__STACKS = eINSTANCE.getStackModel_Stacks();
      EClass STACK = eINSTANCE.getStack();
      EAttribute STACK__ID = eINSTANCE.getStack_Id();
      EAttribute STACK__LOAD = eINSTANCE.getStack_Load();
      EReference STACK__LEFT = eINSTANCE.getStack_Left();
      EReference STACK__RIGHT = eINSTANCE.getStack_Right();
   }

   String eNAME = "stack";
   String eNS_URI = "http://momot.big.tuwien.ac.at/stack/1.0";
   String eNS_PREFIX = "stack";

   StackPackage eINSTANCE = at.ac.tuwien.big.momot.examples.stack.stack.impl.StackPackageImpl.init();

   int STACK_MODEL = 0;
   int STACK_MODEL__STACKS = 0;
   int STACK_MODEL_FEATURE_COUNT = 1;
   int STACK_MODEL_OPERATION_COUNT = 0;

   int STACK = 1;
   int STACK__ID = 0;
   int STACK__LOAD = 1;
   int STACK__LEFT = 2;
   int STACK__RIGHT = 3;
   int STACK_FEATURE_COUNT = 4;
   int STACK_OPERATION_COUNT = 0;

   EClass getStack();

   EAttribute getStack_Id();

   EAttribute getStack_Load();

   EReference getStack_Left();

   EReference getStack_Right();

   StackFactory getStackFactory();

   EClass getStackModel();

   EReference getStackModel_Stacks();

} // StackPackage

