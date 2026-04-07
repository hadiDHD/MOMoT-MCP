package at.ac.tuwien.big.momot.runner;

import java.io.File;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.xmi.impl.EcoreResourceFactoryImpl;

public final class RunnerMain {
   private RunnerMain() {
   }

   public static void main(final String[] args) {
      try {
         final int exitCode = run(args);
         if(exitCode != 0) {
            System.exit(exitCode);
         }
      } catch(final Exception exception) {
         exception.printStackTrace(System.err);
         System.exit(1);
      }
   }

   public static int run(final String[] args) throws Exception {
      final Map<String, String> options = parseArgs(args);
      final String jarValue = firstNonBlank(options.get("jar"), options.get("script"));
      final String mainClass = options.get("mainClass");
      final String workdir = firstNonBlank(options.get("workdir"), System.getProperty("user.dir"));
      final String outdir = firstNonBlank(options.get("out"), Paths.get(workdir, "out").toString());

      if(isBlank(jarValue)) {
         throw new IllegalArgumentException("Missing required option --jar (or --script)");
      }
      if(isBlank(mainClass)) {
         throw new IllegalArgumentException("Missing required option --mainClass");
      }

      final Path jarPath = Paths.get(jarValue).toAbsolutePath().normalize();
      if(!Files.exists(jarPath)) {
         throw new IllegalArgumentException("Jar not found: " + jarPath);
      }

      final Path workPath = Paths.get(workdir).toAbsolutePath().normalize();
      final Path outPath = Paths.get(outdir).toAbsolutePath().normalize();
      Files.createDirectories(workPath);
      Files.createDirectories(outPath);

      final String previousWorkdir = System.getProperty("momot.workdir");
      final String previousOutdir = System.getProperty("momot.out");
      System.setProperty("momot.workdir", workPath.toString());
      System.setProperty("momot.out", outPath.toString());

      final URL[] urls = new URL[] {jarPath.toUri().toURL()};
      final ClassLoader parentLoader = Thread.currentThread().getContextClassLoader();
      try(URLClassLoader classLoader = new URLClassLoader(urls, parentLoader)) {
         final Thread currentThread = Thread.currentThread();
         final ClassLoader previousLoader = currentThread.getContextClassLoader();
         currentThread.setContextClassLoader(classLoader);
         try {
            registerEcorePackages(workPath);
            final Class<?> targetClass = Class.forName(mainClass, true, classLoader);
            final Method mainMethod = targetClass.getMethod("main", String[].class);
            final String[] targetArgs = new String[0];
            mainMethod.invoke(null, (Object) targetArgs);
            return 0;
         } finally {
            currentThread.setContextClassLoader(previousLoader);
         }
      } finally {
         restoreProperty("momot.workdir", previousWorkdir);
         restoreProperty("momot.out", previousOutdir);
      }
   }

   private static Map<String, String> parseArgs(final String[] args) {
      final Map<String, String> options = new LinkedHashMap<>();
      for(int index = 0; index < args.length; index++) {
         final String argument = args[index];
         if(!argument.startsWith("--")) {
            continue;
         }
         final String key = argument.substring(2);
         if("help".equals(key) || "h".equals(key)) {
            options.put("help", "true");
            continue;
         }
         if(index + 1 >= args.length || args[index + 1].startsWith("--")) {
            options.put(key, "true");
            continue;
         }
         options.put(key, args[++index]);
      }
      return options;
   }

   private static void registerEcorePackages(final Path workPath) throws Exception {
      final ResourceSet resourceSet = new ResourceSetImpl();
      resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap().put("ecore", new EcoreResourceFactoryImpl());
      try(Stream<Path> stream = Files.walk(workPath)) {
         final List<Path> ecoreFiles = stream.filter(Files::isRegularFile)
               .filter(path -> path.getFileName().toString().toLowerCase().endsWith(".ecore"))
               .toList();
         for(final Path ecoreFile : ecoreFiles) {
            final URI ecoreUri = URI.createFileURI(ecoreFile.toAbsolutePath().normalize().toString());
            final Resource resource = resourceSet.getResource(ecoreUri, true);
            for(final EObject root : resource.getContents()) {
               registerPackageTree(root);
            }
         }
      }
   }

   private static void registerPackageTree(final EObject object) {
      if(object instanceof EPackage) {
         final EPackage ePackage = (EPackage) object;
         if(!isBlank(ePackage.getNsURI())) {
            EPackage.Registry.INSTANCE.put(ePackage.getNsURI(), ePackage);
         }
      }
      for(final EObject child : object.eContents()) {
         registerPackageTree(child);
      }
   }

   private static void restoreProperty(final String key, final String value) {
      if(value == null) {
         System.clearProperty(key);
      } else {
         System.setProperty(key, value);
      }
   }

   private static boolean isBlank(final String value) {
      return value == null || value.trim().isEmpty();
   }

   private static String firstNonBlank(final String first, final String fallback) {
      if(!isBlank(first)) {
         return first;
      }
      return fallback;
   }
}
