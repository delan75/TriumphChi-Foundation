import { readFile } from 'node:fs/promises';

const base = new URL(process.argv[2] ?? 'https://triumphchi.org/');
if (!['http:', 'https:'].includes(base.protocol))
  throw new Error('Use an HTTP or HTTPS deployment URL.');
const expectedHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const entryPath = (html) => html.match(/<script[^>]+src="([^"]+\/index-[^"]+\.js)"/)?.[1];
const expectedEntry = entryPath(expectedHtml);
if (!expectedEntry) throw new Error('Build the frontend before verifying deployment.');

async function get(path) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return { response, text: await response.text() };
}

const checks = [
  [
    'built entry and source map',
    async () => {
      const { text: html } = await get('/');
      const deployedEntry = entryPath(html);
      if (deployedEntry !== expectedEntry) {
        throw new Error(
          `HTML references ${deployedEntry ?? 'no entry'}, expected ${expectedEntry}. Publish the complete current dist directory, including its HTML and shared chunks.`,
        );
      }
      const { text: script } = await get(deployedEntry);
      const mapFile = script.match(/sourceMappingURL=([^\s]+)/)?.[1];
      if (!mapFile) throw new Error('Entry source map reference is missing.');
      const { text: map } = await get(new URL(mapFile, new URL(deployedEntry, base)).pathname);
      if (JSON.parse(map).version !== 3) throw new Error('Entry source map is invalid.');
      const preloads = [
        ...expectedHtml.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
      ].map((m) => m[1]);
      for (const path of preloads) {
        if (!html.includes(path)) throw new Error(`Shared module preload is missing: ${path}`);
        const { response, text } = await get(path);
        if (
          !/javascript/.test(response.headers.get('content-type') ?? '') ||
          /^\s*<!doctype/i.test(text)
        ) {
          throw new Error(`Shared chunk was not served as JavaScript: ${path}`);
        }
      }
    },
  ],
  [
    'llms.txt Markdown',
    async () => {
      const { response, text } = await get('/llms.txt');
      if (
        !/text\/(plain|markdown)/.test(response.headers.get('content-type') ?? '') ||
        !/^# .+/m.test(text.trimStart()) ||
        !/\[[^\]]+\]\(https?:\/\//.test(text)
      ) {
        throw new Error(
          'llms.txt must return Markdown with an H1 and public links, not the SPA shell.',
        );
      }
    },
  ],
  ...['/ai-catalog.json', '/.well-known/ai-catalog.json', '/ard.json', '/.well-known/ard.json'].map(
    (path) => [
      path,
      async () => {
        const { response, text } = await get(path);
        if (!/json/.test(response.headers.get('content-type') ?? ''))
          throw new Error(`${path}: expected JSON content type, not an HTML fallback.`);
        const expected = JSON.parse(
          await readFile(new URL(`../public${path}`, import.meta.url), 'utf8'),
        );
        if (JSON.stringify(JSON.parse(text)) !== JSON.stringify(expected))
          throw new Error(`${path}: does not match the checked-in catalog.`);
      },
    ],
  ),
];

const results = await Promise.allSettled(
  checks.map(async ([name, check]) => {
    await check();
    console.log(`PASS ${name}`);
  }),
);
for (const [index, result] of results.entries()) {
  if (result.status === 'rejected') {
    console.error(`FAIL ${checks[index][0]}: ${result.reason.message}`);
    process.exitCode = 1;
  }
}
