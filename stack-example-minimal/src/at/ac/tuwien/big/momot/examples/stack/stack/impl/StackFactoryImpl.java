/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack.impl;

import at.ac.tuwien.big.momot.examples.stack.stack.Stack;
import at.ac.tuwien.big.momot.examples.stack.stack.StackFactory;
import at.ac.tuwien.big.momot.examples.stack.stack.StackModel;
import at.ac.tuwien.big.momot.examples.stack.stack.StackPackage;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.impl.EFactoryImpl;
import org.eclipse.emf.ecore.plugin.EcorePlugin;

/**
 * @generated
 */
public class StackFactoryImpl extends EFactoryImpl implements StackFactory {
   @Deprecated
   public static StackPackage getPackage() {
      return StackPackage.eINSTANCE;
   }

   public static StackFactory init() {
      try {
         final StackFactory theStackFactory = (StackFactory) EPackage.Registry.INSTANCE
               .getEFactory(StackPackage.eNS_URI);
         if(theStackFactory != null) {
            return theStackFactory;
         }
      } catch(final Exception exception) {
         EcorePlugin.INSTANCE.log(exception);
      }
      return new StackFactoryImpl();
   }

   public StackFactoryImpl() {
      super();
   }

   @Override
   public EObject create(final EClass eClass) {
      switch(eClass.getClassifierID()) {
         case StackPackage.STACK_MODEL:
            return createStackModel();
         case StackPackage.STACK:
            return createStack();
         default:
            throw new IllegalArgumentException("The class '" + eClass.getName() + "' is not a valid classifier");
      }
   }

   @Override
   public Stack createStack() {
      final StackImpl stack = new StackImpl();
      return stack;
   }

   @Override
   public StackModel createStackModel() {
      final StackModelImpl stackModel = new StackModelImpl();
      return stackModel;
   }

   @Override
   public StackPackage getStackPackage() {
      return (StackPackage) getEPackage();
   }

} // StackFactoryImpl

