/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack.util;

import at.ac.tuwien.big.momot.examples.stack.stack.Stack;
import at.ac.tuwien.big.momot.examples.stack.stack.StackModel;
import at.ac.tuwien.big.momot.examples.stack.stack.StackPackage;

import org.eclipse.emf.common.notify.Adapter;
import org.eclipse.emf.common.notify.Notifier;
import org.eclipse.emf.common.notify.impl.AdapterFactoryImpl;
import org.eclipse.emf.ecore.EObject;

/**
 * @generated
 */
public class StackAdapterFactory extends AdapterFactoryImpl {
   protected static StackPackage modelPackage;

   protected StackSwitch<Adapter> modelSwitch = new StackSwitch<Adapter>() {
      @Override
      public Adapter caseStack(final Stack object) {
         return createStackAdapter();
      }

      @Override
      public Adapter caseStackModel(final StackModel object) {
         return createStackModelAdapter();
      }

      @Override
      public Adapter defaultCase(final EObject object) {
         return createEObjectAdapter();
      }
   };

   public StackAdapterFactory() {
      if(modelPackage == null) {
         modelPackage = StackPackage.eINSTANCE;
      }
   }

   @Override
   public boolean isFactoryForType(final Object object) {
      if(object == modelPackage) {
         return true;
      }
      if(object instanceof EObject) {
         return ((EObject) object).eClass().getEPackage() == modelPackage;
      }
      return false;
   }

   @Override
   public Adapter createAdapter(final Notifier target) {
      return modelSwitch.doSwitch((EObject) target);
   }

   public Adapter createStackAdapter() {
      return null;
   }

   public Adapter createStackModelAdapter() {
      return null;
   }

   public Adapter createEObjectAdapter() {
      return null;
   }
}

