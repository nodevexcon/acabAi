import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from '@rslib/core';
import { version } from './package.json';

const copyReportTemplate = () => ({
  name: 'copy-report-template',
  setup(api) {
    api.onBeforeBuild(({ compiler }) => {
      // Due to the circular dependency between core and report, and the fact that bundle mode will cause report to be lost,
      // we use the approach of injecting report in mcp to avoid this issue
      // TODO: Need to find a better solution in the future
      const destPath = path.join(__dirname, 'src', 'inject-tp.js');
      const srcPath = path.join(
        __dirname,
        '..',
        '..',
        'apps',
        'report',
        'dist',
        'index.html',
      );
      const reportTemplateContent = fs.readFileSync(srcPath, 'utf-8');

      fs.writeFileSync(
        destPath,
        `
        globalThis.get_midscene_report_tpl = ()=> {
          return decodeURIComponent(\`${encodeURIComponent(
            reportTemplateContent,
          )}\`);
        }
        `,
        'utf-8',
      );
    });
    api.onAfterBuild(({ compiler }) => {
      const shebang = '#!/usr/bin/env node\n';

      // Add shebang to index.cjs
      const cjsPath = path.join(__dirname, 'dist', 'index.cjs');
      if (fs.existsSync(cjsPath)) {
        const content = fs.readFileSync(cjsPath, 'utf-8');
        if (!content.startsWith(shebang)) {
          fs.writeFileSync(cjsPath, shebang + content);
        }
      }

      // Add shebang to index.js
      const jsPath = path.join(__dirname, 'dist', 'index.js');
      if (fs.existsSync(jsPath)) {
        const content = fs.readFileSync(jsPath, 'utf-8');
        if (!content.startsWith(shebang)) {
          fs.writeFileSync(jsPath, shebang + content);
        }
      }
    });
  },
});

export default defineConfig({
  source: {
    define: {
      __VERSION__: `'${version}'`,
    },
    entry: {
      index: './src/index.ts',
    },
    preEntry: ['./src/inject-tp.js'],
  },
  output: {
    copy: [
      { from: path.join(__dirname, '../../apps/site/docs/en/API.mdx') },
      { from: path.join(__dirname, './src/playwright-example.txt') },
    ],
  },
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: true,
    },
    {
      format: 'cjs',
      syntax: 'es2021',
    },
  ],
  plugins: [copyReportTemplate()],
});
