import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const html=fs.readFileSync('dist/index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw Error('Hay identificadores HTML duplicados.');
for(const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"#]*)?"/g)){
 const ref=match[1];if(!/^(?:https?:|data:)/.test(ref)&&!fs.existsSync(path.join('dist',ref)))throw Error('Recurso ausente: '+ref);
}
for(const dir of ['dist','dist/state','scripts'])for(const file of fs.readdirSync(dir))if(/\.m?js$/.test(file))execFileSync(process.execPath,['--check',path.join(dir,file)],{stdio:'pipe'});
console.log('Sintaxis y recursos verificados.');
