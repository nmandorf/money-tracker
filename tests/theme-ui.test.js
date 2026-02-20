import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlPath = new URL('../public/index.html', import.meta.url);

test('theme mode selector options are present', async () => {
  const html = await readFile(htmlPath, 'utf8');
  assert.match(html, /<select id="themeMode">/);
  assert.match(html, /<option value="system">System<\/option>/);
  assert.match(html, /<option value="light">Light<\/option>/);
  assert.match(html, /<option value="dark">Dark<\/option>/);
});

test('light and dark token sets are defined for shared surfaces', async () => {
  const html = await readFile(htmlPath, 'utf8');
  assert.match(html, /:root\s*\{/);
  assert.match(html, /:root\[data-theme="dark"\]\s*\{/);
  assert.match(html, /--bg:/);
  assert.match(html, /--card:/);
  assert.match(html, /--ink:/);
  assert.match(html, /--surface-soft:/);
  assert.match(html, /--surface-inset:/);
});

test('theme mode behavior includes persistence and system listener', async () => {
  const html = await readFile(htmlPath, 'utf8');
  assert.match(html, /localStorage\.setItem\(THEME_KEY, mode\)/);
  assert.match(html, /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)/);
  assert.match(html, /media\.addEventListener\('change'/);
  assert.match(html, /document\.documentElement\.dataset\.theme = resolved/);
});
