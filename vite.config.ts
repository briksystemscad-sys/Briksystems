import {resolve} from 'node:path';
import fs from 'node:fs';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {PAGES} from './scripts/pages.js';

export default defineConfig({
  resolve: {preserveSymlinks:true},
  plugins: [react(), {
    name: 'physical-page-rewrite',
    configureServer(server) {
      server.middlewares.use((req,res,next) => {
        const url=req.url?.split('?')[0];
        if(url && !['/api','/src','/@','/pages'].some(prefix=>url.startsWith(prefix)) && (!url.includes('.') || url.endsWith('/index.html'))) {
          const clean=url.replace(/\/index\.html$/,'').replace(/\/$/,'');
          const page='/pages'+clean+'/index.html';
          if(fs.existsSync(resolve(__dirname,'.'+page))) req.url=page;
        }
        next();
      });
    },
  }],
  server: {port:3000,open:true},
  build: {rollupOptions:{input:{main:resolve(__dirname,'index.html'),...Object.fromEntries(PAGES.map(page=>[page.route.slice(2).replaceAll('/','-'),resolve(__dirname,page.filePath)]))}}},
});
