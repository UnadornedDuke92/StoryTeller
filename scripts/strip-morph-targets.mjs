/**
 * Strips morph targets from all GLB models in android/app/src/main/assets/models/
 * ViroReact's VROGLTFLoader crashes on morph targets (processMorphTargets bug).
 */
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup } from '@gltf-transform/functions';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { readdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'models');

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

const files = readdirSync(MODELS_DIR).filter(f => f.endsWith('.glb'));
console.log(`Found ${files.length} GLB files: ${files.join(', ')}\n`);

for (const file of files) {
  const filePath = join(MODELS_DIR, file);
  console.log(`Processing: ${file}`);

  let doc;
  try {
    doc = await io.read(filePath);
  } catch (e) {
    console.error(`  ✗ Failed to read: ${e.message}`);
    continue;
  }

  const root = doc.getRoot();
  let morphTargetsRemoved = 0;

  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const targets = prim.listTargets();
      for (const target of targets) {
        prim.removeTarget(target);
        target.dispose();
        morphTargetsRemoved++;
      }
    }
  }

  if (morphTargetsRemoved === 0) {
    console.log(`  ✓ No morph targets found — skipping\n`);
    continue;
  }

  console.log(`  Removed ${morphTargetsRemoved} morph target(s) — cleaning up…`);

  await doc.transform(dedup(), prune());
  console.log(`  Pruned dangling accessors and deduplicated resources.`);

  const backup = filePath.replace('.glb', '_backup.glb');
  renameSync(filePath, backup);

  try {
    await io.write(filePath, doc);
    console.log(`  ✓ Written (backup saved as ${file.replace('.glb', '_backup.glb')})\n`);
  } catch (e) {
    console.error(`  ✗ Failed to write: ${e.message}`);
    renameSync(backup, filePath); // restore backup
  }
}

console.log('Done.');
