import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.Diagnostician;
import org.eclipse.emf.ecore.xmi.impl.EcoreResourceFactoryImpl;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class EcoreValidator {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("{\"success\": false, \"errors\": [\"Missing arguments\"], \"warnings\": [], \"tier\": \"structure\"}");
            System.exit(1);
        }

        String mode = args[0];
        String ecorePath = args[1];

        File file = new File(ecorePath);
        if (!file.exists()) {
            System.out.println("{\"success\": false, \"errors\": [\"File not found: " + ecorePath.replace("\\", "/") + "\"], \"warnings\": [], \"tier\": \"structure\"}");
            System.exit(1);
        }

        try {
            ResourceSet resourceSet = new ResourceSetImpl();
            resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap().put("ecore", new EcoreResourceFactoryImpl());
            Resource resource = resourceSet.getResource(URI.createFileURI(file.getAbsolutePath()), true);

            if (resource.getContents().isEmpty()) {
                System.out.println("{\"success\": false, \"errors\": [\"Ecore file is empty\"], \"warnings\": [], \"tier\": \"structure\"}");
                System.exit(1);
            }

            EPackage ePackage = (EPackage) resource.getContents().get(0);
            List<String> errors = new ArrayList<>();

            // Validate nsURI
            if (ePackage.getNsURI() == null || ePackage.getNsURI().trim().isEmpty()) {
                errors.add("Missing nsURI in EPackage");
            }

            // Validate nsPrefix
            if (ePackage.getNsPrefix() == null || ePackage.getNsPrefix().trim().isEmpty()) {
                errors.add("Missing nsPrefix in EPackage");
            }

            // Run EMF Diagnostician
            Diagnostic diagnostic = Diagnostician.INSTANCE.validate(ePackage);
            if (diagnostic.getSeverity() == Diagnostic.ERROR) {
                for (Diagnostic child : diagnostic.getChildren()) {
                    if (child.getSeverity() == Diagnostic.ERROR) {
                        errors.add(child.getMessage());
                    }
                }
            }

            if (errors.isEmpty()) {
                System.out.println("{\"success\": true, \"errors\": [], \"warnings\": [], \"tier\": \"" + mode.replace("--validate-", "") + "\"}");
                System.exit(0);
            } else {
                StringBuilder sb = new StringBuilder();
                sb.append("{\"success\": false, \"errors\": [");
                for (int i = 0; i < errors.size(); i++) {
                    sb.append("\"").append(errors.get(i).replace("\"", "\\\"")).append("\"");
                    if (i < errors.size() - 1) sb.append(",");
                }
                sb.append("], \"warnings\": [], \"tier\": \"semantic\"}");
                System.out.println(sb.toString());
                System.exit(1);
            }
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            System.out.println("{\"success\": false, \"errors\": [\"EMF load failure: " + msg.replace("\"", "\\\"").replace("\n", " ") + "\"], \"warnings\": [], \"tier\": \"structure\"}");
            System.exit(1);
        }
    }
}
