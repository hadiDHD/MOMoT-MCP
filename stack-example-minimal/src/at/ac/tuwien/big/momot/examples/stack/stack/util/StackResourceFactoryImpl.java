/**
 */
package at.ac.tuwien.big.momot.examples.stack.stack.util;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.impl.ResourceFactoryImpl;

/**
 * @generated
 */
public class StackResourceFactoryImpl extends ResourceFactoryImpl {
   public StackResourceFactoryImpl() {
      super();
   }

   @Override
   public Resource createResource(final URI uri) {
      final Resource result = new StackResourceImpl(uri);
      return result;
   }
}

