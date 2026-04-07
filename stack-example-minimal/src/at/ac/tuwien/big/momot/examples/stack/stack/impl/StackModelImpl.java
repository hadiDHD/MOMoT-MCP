/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack.impl;

import at.ac.tuwien.big.momot.examples.stack.stack.Stack;
import at.ac.tuwien.big.momot.examples.stack.stack.StackModel;
import at.ac.tuwien.big.momot.examples.stack.stack.StackPackage;

import java.util.Collection;

import org.eclipse.emf.common.notify.NotificationChain;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;
import org.eclipse.emf.ecore.impl.MinimalEObjectImpl;
import org.eclipse.emf.ecore.util.EObjectContainmentEList;
import org.eclipse.emf.ecore.util.InternalEList;

/**
 * @generated
 */
public class StackModelImpl extends MinimalEObjectImpl.Container implements StackModel {
   protected EList<Stack> stacks;

   protected StackModelImpl() {
      super();
   }

   @Override
   protected EClass eStaticClass() {
      return StackPackage.Literals.STACK_MODEL;
   }

   @Override
   public EList<Stack> getStacks() {
      if(stacks == null) {
         stacks = new EObjectContainmentEList<>(Stack.class, this, StackPackage.STACK_MODEL__STACKS);
      }
      return stacks;
   }

   @Override
   public Object eGet(final int featureID, final boolean resolve, final boolean coreType) {
      switch(featureID) {
         case StackPackage.STACK_MODEL__STACKS:
            return getStacks();
      }
      return super.eGet(featureID, resolve, coreType);
   }

   @SuppressWarnings("unchecked")
   @Override
   public void eSet(final int featureID, final Object newValue) {
      switch(featureID) {
         case StackPackage.STACK_MODEL__STACKS:
            getStacks().clear();
            getStacks().addAll((Collection<? extends Stack>) newValue);
            return;
      }
      super.eSet(featureID, newValue);
   }

   @Override
   public void eUnset(final int featureID) {
      switch(featureID) {
         case StackPackage.STACK_MODEL__STACKS:
            getStacks().clear();
            return;
      }
      super.eUnset(featureID);
   }

   @Override
   public boolean eIsSet(final int featureID) {
      switch(featureID) {
         case StackPackage.STACK_MODEL__STACKS:
            return stacks != null && !stacks.isEmpty();
      }
      return super.eIsSet(featureID);
   }

   @Override
   public NotificationChain eInverseRemove(final InternalEObject otherEnd, final int featureID,
         final NotificationChain msgs) {
      switch(featureID) {
         case StackPackage.STACK_MODEL__STACKS:
            return ((InternalEList<?>) getStacks()).basicRemove(otherEnd, msgs);
      }
      return super.eInverseRemove(otherEnd, featureID, msgs);
   }

   @Override
   public String toString() {
      String uri = "";
      if(eResource() != null && eResource().getURI() != null) {
         uri = " (" + eResource().getURI().lastSegment() + ")";
      }
      return "Stack with " + getStacks().size() + " stacks" + uri;
   }
}

