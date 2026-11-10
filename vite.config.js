import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function localApiPlugin() {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/api/')) {
          const endpoint = url.pathname.replace('/api/', '').split('?')[0];
          try {
            let mod;
            if (endpoint === 'members') mod = await import('./api/members.js');
            else if (endpoint === 'admin-session') mod = await import('./api/admin-session.js');
            else if (endpoint === 'contact') mod = await import('./api/contact.js');
            else if (endpoint === 'upload') mod = await import('./api/upload.js');

            if (mod && mod.default) {
              const chunks = [];
              req.on('data', chunk => chunks.push(chunk));
              req.on('end', async () => {
                const rawBody = Buffer.concat(chunks).toString();
                req.query = Object.fromEntries(url.searchParams.entries());
                try {
                  req.body = rawBody ? JSON.parse(rawBody) : {};
                } catch {
                  req.body = rawBody;
                }
                res.status = (code) => { res.statusCode = code; return res; };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };
                res.send = (data) => {
                  res.end(data);
                  return res;
                };
                res.redirect = (statusOrUrl, optUrl) => {
                  const status = typeof statusOrUrl === 'number' ? statusOrUrl : 302;
                  const target = typeof statusOrUrl === 'number' ? optUrl : statusOrUrl;
                  res.statusCode = status;
                  res.setHeader('Location', target);
                  res.end();
                  return res;
                };
                await mod.default(req, res);
              });
              return;
            }
          } catch (err) {
            console.error('Local API error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), localApiPlugin()],
  esbuild: {
    legalComments: 'none',
  },
  build: {
    sourcemap: false, // Security: Never leak source maps or raw source code in production
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets < 4KB to save network roundtrips
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['framer-motion'],
          'particles-vendor': ['@tsparticles/react', '@tsparticles/slim'],
          'icons-vendor': ['lucide-react'],
          'qr-vendor': ['html5-qrcode', 'qrcode'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
