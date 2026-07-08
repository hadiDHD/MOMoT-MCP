import fs from 'node:fs';
import path from 'node:path';
import { validateHenshin } from '../lib.js';

export async function generateHenshin({ ecorePath, ecoreContent, nlDescription, outputPath, validate = true }) {
  let content = ecoreContent;
  if (!content && ecorePath) {
    const resolved = path.resolve(process.cwd(), ecorePath);
    content = fs.readFileSync(resolved, 'utf8');
  }

  if (!content) {
    throw new Error('Provide either ecorePath or ecoreContent.');
  }

  // Parse Ecore
  const nsUriMatch = content.match(/nsURI\s*=\s*"([^"]+)"/);
  const packageMatch = content.match(/<[^>]*EPackage[^>]*\sname\s*=\s*"([^"]+)"/);
  const classNames = Array.from(content.matchAll(/<[^>]*EClass[^>]*\sname\s*=\s*"([^"]+)"/g)).map((m) => m[1]);

  const nsURI = nsUriMatch ? nsUriMatch[1] : 'http://generated/1.0';
  const packageName = packageMatch ? packageMatch[1] : 'generated';
  const classes = Array.from(new Set(classNames));
  const firstClass = classes[0] || 'Root';

  // Build Henshin XML Module
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<henshin:Module xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:henshin="http://www.eclipse.org/emf/2011/Henshin" name="Generated">',
    `  <imports href="${escapeXml(nsURI)}#/"/>`
  ];

  // Add Create rules for first 3 classes
  classes.slice(0, 3).forEach((className) => {
    lines.push(`  <units xsi:type="henshin:Rule" name="create_${escapeXml(className)}">`);
    lines.push('    <lhs/>');
    lines.push('    <rhs>');
    lines.push(`      <nodes name="newNode" type="${escapeXml(nsURI)}#//${escapeXml(className)}"/>`);
    lines.push('    </rhs>');
    lines.push('  </units>');
  });

  // Add Delete rule for first class
  if (classes.length > 0) {
    lines.push(`  <units xsi:type="henshin:Rule" name="delete_${escapeXml(firstClass)}">`);
    lines.push('    <lhs>');
    lines.push(`      <nodes name="toDelete" type="${escapeXml(nsURI)}#//${escapeXml(firstClass)}"/>`);
    lines.push('    </lhs>');
    lines.push('    <rhs/>');
    lines.push('  </units>');
  }

  lines.push('</henshin:Module>');
  lines.push('');

  const henshinContent = lines.join('\n');
  const finalOutputPath = outputPath || `model/${packageName}.henshin`;
  const resolvedPath = path.resolve(process.cwd(), finalOutputPath);

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, henshinContent, 'utf8');

  let validationResult = {
    success: true,
    exitCode: 0,
    result: { valid: true }
  };

  if (validate) {
    if (ecorePath) {
      validationResult = await validateHenshin({
        henshinPath: resolvedPath,
        mode: 'semantic',
        metamodelPath: path.resolve(process.cwd(), ecorePath)
      });
    } else {
      validationResult = await validateHenshin({
        henshinPath: resolvedPath,
        mode: 'structure'
      });
    }
  }

  return {
    success: true,
    henshinContent,
    henshinPath: finalOutputPath,
    validationResult
  };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
