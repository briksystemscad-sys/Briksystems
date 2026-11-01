import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parse} from '@babel/parser';
import {PAGES} from './pages.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const routes=['#/',...PAGES.map(page=>page.route)];
let checks=0;
function runtime(html,url) {
  const current=new URL(url);
  const location={href:current.href,protocol:current.protocol,pathname:current.pathname,origin:current.origin,hash:current.hash,assign(value){this.assigned=value;},replace(value){this.replaced=value;}};
  const base={};
  const window={location};
  const context={window,URL,Set,document:{createElement(){return base;},head:{appendChild(){}},addEventListener(){},querySelectorAll(){return [];}}};
  vm.createContext(context);
  for(const id of ['brik-page-context','brik-page-navigation']) {
    const script=html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)<\\/script>'));
    assert(script,'Missing page context: '+url);
    vm.runInContext(script[1],context);
  }
  return {window,base};
}
const sourceFiles=['index.html',...PAGES.map(page=>page.filePath)];
for(const relative of sourceFiles) {
  const html=fs.readFileSync(path.join(root,relative),'utf8');
  const local=runtime(html,pathToFileURL(path.join(root,relative)).href);
  for(const route of routes) {
    const href=local.window.siteHref(route);
    assert(href.startsWith('file:')&&!new URL(href).hash,'Local route still uses a fragment: '+href);
    assert(fs.existsSync(fileURLToPath(href)),'Missing local target: '+href);
    checks++;
  }
  const logo=new URL('public/assets/logo.png',local.base.href);
  assert(fs.existsSync(fileURLToPath(logo)),'Nested page asset base is wrong: '+relative);
  const hosted=runtime(html,'https://briksystems.com/'+relative.replace(/^pages\//,''));
  assert(hosted.window.siteHref('#/contact')==='https://briksystems.com/contact/','Hosted contact URL is wrong');
  assert(hosted.window.siteHref('mailto:test@example.com')==='mailto:test@example.com','External protocol changed');
  const legacy=runtime(html,pathToFileURL(path.join(root,relative)).href+'#/contact');
  assert(legacy.window.location.replaced===legacy.window.siteHref('#/contact'),'Legacy hash URL was not upgraded');
  const app=html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/)[1];
  const ast=parse(app,{plugins:['jsx']});
  function walk(node) {
    if(!node||typeof node!=='object')return;
    assert(!(node.type==='JSXAttribute'&&node.name.name==='href'&&node.value?.type==='StringLiteral'&&node.value.value.startsWith('#/')),'Raw hash link in '+relative);
    assert(!(node.type==='AssignmentExpression'&&app.slice(node.left.start,node.left.end)==='window.location.hash'),'Hash navigation assignment in '+relative);
    for(const [key,value]of Object.entries(node)) {
      if(['loc','start','end','extra'].includes(key))continue;
      if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);
    }
  }
  walk(ast);
}
if(fs.existsSync(path.join(root,'dist/index.html'))) {
  for(const relative of ['index.html',...PAGES.map(page=>page.filePath.replace(/^pages\//,''))]) {
    const absolute=path.join(root,'dist',relative);
    const html=fs.readFileSync(absolute,'utf8');
    const local=runtime(html,pathToFileURL(absolute).href);
    for(const route of routes) {
      const href=local.window.siteHref(route);
      assert(fs.existsSync(fileURLToPath(href)),'Missing built page: '+href);
      assert(!new URL(href).hash,'Built route still uses a fragment');
      checks++;
    }
    assert(fs.existsSync(fileURLToPath(new URL('assets/logo.png',local.base.href))),'Built page asset base is wrong');
  }
}
console.log('Passed '+checks+' physical-page link checks, plus nested assets, hosted URLs and legacy-link compatibility.');
