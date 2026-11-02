import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from '../src/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const result = build({ root, base: process.env.BASE_PATH ?? '', siteUrl: process.env.SITE_URL ?? '' });
console.log(`built ${result.pages} pages, ${result.events} events`);
