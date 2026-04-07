/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack.impl;

import at.ac.tuwien.big.momot.examples.stack.stack.Stack;
import at.ac.tuwien.big.momot.examples.stack.stack.StackPackage;

import org.eclipse.emf.common.notify.Notification;
import org.eclipse.emf.common.notify.NotificationChain;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;
import org.eclipse.emf.ecore.impl.ENotificationImpl;
import org.eclipse.emf.ecore.impl.MinimalEObjectImpl;

/**
 * @generated
 */
public class StackImpl extends MinimalEObjectImpl.Container implements Stack {
   protected static final String ID_EDEFAULT = null;
   protected static final int LOAD_EDEFAULT = 0;

   protected String id = ID_EDEFAULT;
   protected int load = LOAD_EDEFAULT;

   protected Stack left;
   protected Stack right;

   protected StackImpl() {
      super();
   }

   @Override
   protected EClass eStaticClass() {
      return StackPackage.Literals.STACK;
   }

   @Override
   public String getId() {
      return id;
   }

   @Override
   public void setId(final String newId) {
      final String oldId = id;
      id = newId;
      if(eNotificationRequired()) {
         eNotify(new ENotificationImpl(this, Notification.SET, StackPackage.STACK__ID, oldId, id));
      }
   }

   @Override
   public int getLoad() {
      return load;
   }

   @Override
   public void setLoad(final int newLoad) {
      final int oldLoad = load;
      load = newLoad;
      if(eNotificationRequired()) {
         eNotify(new ENotificationImpl(this, Notification.SET, StackPackage.STACK__LOAD, oldLoad, load));
      }
   }

   @Override
   public Stack getLeft() {
      if(left != null && left.eIsProxy()) {
         final InternalEObject oldLeft = (InternalEObject) left;
         left = (Stack) eResolveProxy(oldLeft);
         if(left != oldLeft && eNotificationRequired()) {
            eNotify(new ENotificationImpl(this, Notification.RESOLVE, StackPackage.STACK__LEFT, oldLeft, left));
         }
      }
      return left;
   }

   public Stack basicGetLeft() {
      return left;
   }

   @Override
   public void setLeft(final Stack newLeft) {
      if(newLeft != left) {
         NotificationChain msgs = null;
         if(left != null) {
            msgs = ((InternalEObject) left).eInverseRemove(this, StackPackage.STACK__RIGHT, Stack.class, msgs);
         }
         if(newLeft != null) {
            msgs = ((InternalEObject) newLeft).eInverseAdd(this, StackPackage.STACK__RIGHT, Stack.class, msgs);
         }
         msgs = basicSetLeft(newLeft, msgs);
         if(msgs != null) {
            msgs.dispatch();
         }
      } else if(eNotificationRequired()) {
         eNotify(new ENotificationImpl(this, Notification.SET, StackPackage.STACK__LEFT, newLeft, newLeft));
      }
   }

   public NotificationChain basicSetLeft(final Stack newLeft, NotificationChain msgs) {
      final Stack oldLeft = left;
      left = newLeft;
      if(eNotificationRequired()) {
         final ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, StackPackage.STACK__LEFT,
               oldLeft, newLeft);
         if(msgs == null) {
            msgs = notification;
         } else {
            msgs.add(notification);
         }
      }
      return msgs;
   }

   @Override
   public Stack getRight() {
      if(right != null && right.eIsProxy()) {
         final InternalEObject oldRight = (InternalEObject) right;
         right = (Stack) eResolveProxy(oldRight);
         if(right != oldRight && eNotificationRequired()) {
            eNotify(new ENotificationImpl(this, Notification.RESOLVE, StackPackage.STACK__RIGHT, oldRight, right));
         }
      }
      return right;
   }

   public Stack basicGetRight() {
      return right;
   }

   @Override
   public void setRight(final Stack newRight) {
      if(newRight != right) {
         NotificationChain msgs = null;
         if(right != null) {
            msgs = ((InternalEObject) right).eInverseRemove(this, StackPackage.STACK__LEFT, Stack.class, msgs);
         }
         if(newRight != null) {
            msgs = ((InternalEObject) newRight).eInverseAdd(this, StackPackage.STACK__LEFT, Stack.class, msgs);
         }
         msgs = basicSetRight(newRight, msgs);
         if(msgs != null) {
            msgs.dispatch();
         }
      } else if(eNotificationRequired()) {
         eNotify(new ENotificationImpl(this, Notification.SET, StackPackage.STACK__RIGHT, newRight, newRight));
      }
   }

   public NotificationChain basicSetRight(final Stack newRight, NotificationChain msgs) {
      final Stack oldRight = right;
      right = newRight;
      if(eNotificationRequired()) {
         final ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, StackPackage.STACK__RIGHT,
               oldRight, newRight);
         if(msgs == null) {
            msgs = notification;
         } else {
            msgs.add(notification);
         }
      }
      return msgs;
   }

   @Override
   public NotificationChain eInverseAdd(final InternalEObject otherEnd, final int featureID, NotificationChain msgs) {
      switch(featureID) {
         case StackPackage.STACK__LEFT:
            if(left != null) {
               msgs = ((InternalEObject) left).eInverseRemove(this, StackPackage.STACK__RIGHT, Stack.class, msgs);
            }
            return basicSetLeft((Stack) otherEnd, msgs);
         case StackPackage.STACK__RIGHT:
            if(right != null) {
               msgs = ((InternalEObject) right).eInverseRemove(this, StackPackage.STACK__LEFT, Stack.class, msgs);
            }
            return basicSetRight((Stack) otherEnd, msgs);
      }
      return super.eInverseAdd(otherEnd, featureID, msgs);
   }

   @Override
   public NotificationChain eInverseRemove(final InternalEObject otherEnd, final int featureID,
         final NotificationChain msgs) {
      switch(featureID) {
         case StackPackage.STACK__LEFT:
            return basicSetLeft(null, msgs);
         case StackPackage.STACK__RIGHT:
            return basicSetRight(null, msgs);
      }
      return super.eInverseRemove(otherEnd, featureID, msgs);
   }

   @Override
   public Object eGet(final int featureID, final boolean resolve, final boolean coreType) {
      switch(featureID) {
         case StackPackage.STACK__ID:
            return getId();
         case StackPackage.STACK__LOAD:
            return getLoad();
         case StackPackage.STACK__LEFT:
            if(resolve) {
               return getLeft();
            }
            return basicGetLeft();
         case StackPackage.STACK__RIGHT:
            if(resolve) {
               return getRight();
            }
            return basicGetRight();
      }
      return super.eGet(featureID, resolve, coreType);
   }

   @Override
   public void eSet(final int featureID, final Object newValue) {
      switch(featureID) {
         case StackPackage.STACK__ID:
            setId((String) newValue);
            return;
         case StackPackage.STACK__LOAD:
            setLoad((Integer) newValue);
            return;
         case StackPackage.STACK__LEFT:
            setLeft((Stack) newValue);
            return;
         case StackPackage.STACK__RIGHT:
            setRight((Stack) newValue);
            return;
      }
      super.eSet(featureID, newValue);
   }

   @Override
   public void eUnset(final int featureID) {
      switch(featureID) {
         case StackPackage.STACK__ID:
            setId(ID_EDEFAULT);
            return;
         case StackPackage.STACK__LOAD:
            setLoad(LOAD_EDEFAULT);
            return;
         case StackPackage.STACK__LEFT:
            setLeft((Stack) null);
            return;
         case StackPackage.STACK__RIGHT:
            setRight((Stack) null);
            return;
      }
      super.eUnset(featureID);
   }

   @Override
   public boolean eIsSet(final int featureID) {
      switch(featureID) {
         case StackPackage.STACK__ID:
            return ID_EDEFAULT == null ? id != null : !ID_EDEFAULT.equals(id);
         case StackPackage.STACK__LOAD:
            return load != LOAD_EDEFAULT;
         case StackPackage.STACK__LEFT:
            return left != null;
         case StackPackage.STACK__RIGHT:
            return right != null;
      }
      return super.eIsSet(featureID);
   }

   @Override
   public int hashCode() {
      final int prime = 31;
      int result = 1;
      result = prime * result + (id == null ? 0 : id.hashCode());
      return result;
   }

   @Override
   public boolean equals(final Object obj) {
      if(this == obj) {
         return true;
      }
      if(obj == null) {
         return false;
      }
      if(getClass() != obj.getClass()) {
         return false;
      }
      final StackImpl other = (StackImpl) obj;
      if(id == null) {
         if(other.id != null) {
            return false;
         }
      } else if(!id.equals(other.id)) {
         return false;
      }
      return true;
   }

   @Override
   public String toString() {
      if(eIsProxy()) {
         return super.toString();
      }
      final StringBuffer result = new StringBuffer(super.toString());
      result.append(" (id: ");
      result.append(id);
      result.append(", load: ");
      result.append(load);
      result.append(')');
      return result.toString();
   }
}

