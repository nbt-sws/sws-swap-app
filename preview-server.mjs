import { preview } from 'vite';

async function start() {
  const server = await preview({
    root: '.',
    port: 4173,
    host: '127.0.0.1',
    open: false,
  });
  console.log(`Preview server running at http://${server.httpServer.address().address}:${server.httpServer.address().port}`);
}

start();
