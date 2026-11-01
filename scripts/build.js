import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import {PAGES} from './pages.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await import('./generate-pages.js');
execFileSync(process.execPath, [path.join(root,'node_modules/typescript/bin/tsc'),'--noEmit'], {cwd:root,stdio:'inherit'});

// Write sequentially to avoid Windows concurrent-directory creation failures.
const result = await build({root,configFile:path.join(root,'vite.config.ts'),build:{write:false,copyPublicDir:false}});
const cacheRoot = path.join(root,'.build');
fs.mkdirSync(cacheRoot,{recursive:true});
const staging = fs.mkdtempSync(path.join(cacheRoot,'production-'));
fs.cpSync(path.join(root,'public'),staging,{recursive:true});
for(const bundle of Array.isArray(result)?result:[result]) {
  if(!bundle.output) throw new Error('Unexpected Vite output.');
  for(const item of bundle.output) {
    const relative = item.fileName.replace(/^pages\//,'');
    const destination = path.resolve(staging,relative);
    if(!destination.startsWith(staging+path.sep)) throw new Error('Build path escapes staging.');
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.writeFileSync(destination,item.type==='asset'?item.source:item.code);
  }
}
for(const relative of ['index.html',...PAGES.map(page=>page.filePath.replace(/^pages\//,''))]) {
  if(!fs.existsSync(path.join(staging,relative))) throw new Error('Build is missing '+relative);
}
const dist = path.resolve(root,'dist');
if(path.dirname(dist)!==root || path.basename(dist)!=='dist' || path.dirname(staging)!==cacheRoot) throw new Error('Unsafe build output path.');
fs.rmSync(dist,{recursive:true,force:true});
fs.renameSync(staging,dist);
fs.rmdirSync(cacheRoot);
console.log('Built '+(PAGES.length+1)+' separate HTML pages in dist/.');
