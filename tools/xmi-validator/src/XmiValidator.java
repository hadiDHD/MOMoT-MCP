import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.Diagnostician;
import org.eclipse.emf.ecore.xmi.impl.EcoreResourceFactoryImpl;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceFactoryImpl;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class XmiValidator {
    public static void main(String[] args) {
        String mode = "";
        String xmiPath = "";
        String ecorePath = "";

        for (int i = 0; i < args.length; i++) {
            if ("--validate-structure".equals(args[i])) {
                mode = "structure";
                xmiPath = args[++i];
            } else if ("--validate-semantic".equals(args[i])) {
                mode = "semantic";
                xmiPath = args[++i];
            } else if ("--load".equals(args[i])) {
                mode = "load";
                xmiPath = args[++i];
            } else if ("--ecore".equals(args[i])) {
                ecorePath = args[++i];
            }
        }

        File xmiFile = new File(xmiPath);
        if (!xmiFile.exists()) {
            System.out.println("{\"success\": false, \"errors\": [\"File not found: " + xmiPath + "\"]}");
            System.exit(1);
        }

        // Structural validation checks raw XML well-formedness
        if ("structure".equals(mode)) {
            try {
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                factory.setNamespaceAware(true);
                DocumentBuilder builder = factory.newDocumentBuilder();
                builder.parse(xmiFile);
                System.out.println("{\"success\": true, \"errors\": [], \"warnings\": [], \"tier\": \"structure\"}");
                System.exit(0);
            } catch (Exception e) {
                System.out.println("{\"success\": false, \"errors\": [\"XML structure is invalid: " + e.getMessage().replace("\"", "\\\"") + "\"], \"warnings\": [], \"tier\": \"structure\"}");
                System.exit(1);
            }
        }

        try {
            ResourceSet resourceSet = new ResourceSetImpl();
            resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap().put("ecore", new EcoreResourceFactoryImpl());
            resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap().put("xmi", new XMIResourceFactoryImpl());

            if (ecorePath != null && !ecorePath.isEmpty()) {
                File ecoreFile = new File(ecorePath);
                if (ecoreFile.exists()) {
                    Resource ecoreRes = resourceSet.getResource(URI.createFileURI(ecoreFile.getAbsolutePath()), true);
                    if (!ecoreRes.getContents().isEmpty()) {
                        EPackage ePackage = (EPackage) ecoreRes.getContents().get(0);
                        resourceSet.getPackageRegistry().put(ePackage.getNsURI(), ePackage);
                    }
                }
            }

            Resource xmiRes = resourceSet.getResource(URI.createFileURI(xmiFile.getAbsolutePath()), true);
            if (xmiRes.getContents().isEmpty()) {
                System.out.println("{\"success\": false, \"errors\": [\"XMI file has no contents\"], \"warnings\": [], \"tier\": \"" + mode + "\"}");
                System.exit(1);
            }

            List<String> errors = new ArrayList<>();
            EObject rootObj = xmiRes.getContents().get(0);

            // Diagnostician validation
            if (mode.equals("semantic")) {
                Diagnostic diagnostic = Diagnostician.INSTANCE.validate(rootObj);
                if (diagnostic.getSeverity() == Diagnostic.ERROR) {
                    for (Diagnostic child : diagnostic.getChildren()) {
                        if (child.getSeverity() == Diagnostic.ERROR) {
                            errors.add(child.getMessage());
                        }
                    }
                }
            }

            if (errors.isEmpty()) {
                System.out.println("{\"success\": true, \"errors\": [], \"warnings\": [], \"tier\": \"" + mode + "\"}");
                System.exit(0);
            } else {
                StringBuilder sb = new StringBuilder();
                sb.append("{\"success\": false, \"errors\": [");
                for (int i = 0; i < errors.size(); i++) {
                    sb.append("\"").append(errors.get(i).replace("\"", "\\\"")).append("\"");
                    if (i < errors.size() - 1) sb.append(",");
                }
                sb.append("], \"warnings\": [], \"tier\": \"" + mode + "\"}");
                System.out.println(sb.toString());
                System.exit(1);
            }

        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            System.out.println("{\"success\": false, \"errors\": [\"EMF XMI load/validation failure: " + msg.replace("\"", "\\\"").replace("\n", " ") + "\"], \"warnings\": [], \"tier\": \"" + mode + "\"}");
            System.exit(1);
        }
    }
}
