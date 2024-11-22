import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './src/main.server';

export function createApp(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');
  const commonEngine = new CommonEngine();

  // Set up view engine and static files
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);
  server.use(express.static(browserDistFolder, { maxAge: '1y', index: false }));

  // Handle API routes (placeholder)
  // server.get('/api/**', (req, res) => { });

  // Universal rendering for Angular routes
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html: string) => res.send(html))
      .catch((err: Error) => {
        console.error('Error rendering Angular app:', err);
        next(err);
      });
  });

  return server;
}

function startServer(): void {
  const port = process.env['PORT'] || 4000;

  const server = createApp();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

startServer();