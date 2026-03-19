import path from 'node:path';
import { buildConfig } from '../build.config.mjs';
import { createStaticServer } from './shared-server.mjs';

createStaticServer(path.resolve(buildConfig.root), buildConfig.devPort);
