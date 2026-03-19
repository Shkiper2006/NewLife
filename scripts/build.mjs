import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { buildConfig } from '../build.config.mjs';

const rootDir = path.resolve(buildConfig.root);
const outDir = path.resolve(buildConfig.outDir);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(path.join(rootDir, buildConfig.entryHtml), path.join(outDir, 'index.html'));
await cp(path.join(rootDir, buildConfig.sourceDir), path.join(outDir, buildConfig.sourceDir), { recursive: true });

console.log(`Build completed: ${outDir}`);
