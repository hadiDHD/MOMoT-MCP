/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack.util;

import at.ac.tuwien.big.momot.examples.stack.stack.Stack;
import at.ac.tuwien.big.momot.examples.stack.stack.StackModel;
import at.ac.tuwien.big.momot.examples.stack.stack.StackPackage;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.util.Switch;

/**
 * @generated
 */
public class StackSwitch<T> extends Switch<T> {
   protected static StackPackage modelPackage;

   public StackSwitch() {
      if(modelPackage == null) {
         modelPackage = StackPackage.eINSTANCE;
      }
   }

   public T caseStack(final Stack object) {
      return null;
   }

   public T caseStackModel(final StackModel object) {
      return null;
   }

   @Override
   public T defaultCase(final EObject object) {
      return null;
   }

   @Override
   protected T doSwitch(final int classifierID, final EObject theEObject) {
      switch(classifierID) {
         case StackPackage.STACK_MODEL: {
            final StackModel stackModel = (StackModel) theEObject;
            T result = caseStackModel(stackModel);
            if(result == null) {
               result = defaultCase(theEObject);
            }
            return result;
         }
         case StackPackage.STACK: {
            final Stack stack = (Stack) theEObject;
            T result = caseStack(stack);
            if(result == null) {
               result = defaultCase(theEObject);
            }
            return result;
         }
         default:
            return defaultCase(theEObject);
      }
   }

   @Override
   protected boolean isSwitchFor(final EPackage ePackage) {
      return ePackage == modelPackage;
   }
}

