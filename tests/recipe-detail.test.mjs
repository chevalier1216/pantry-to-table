import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {defaultRecipes} from '../lib/recipe-candidates.mjs';

// Render the production detail component (also used for favorite snapshots).
// TypeScript is already a project dependency; no browser/network fixture required.
const source = await readFile(new URL('../components/recipe-detail.tsx', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext}}).outputText
 .replace(/from "react\/jsx-runtime"/g, `from ${JSON.stringify(import.meta.resolve('react/jsx-runtime'))}`)
 .replace(/from '([^']+\.mjs)'/g, (_,path)=>`from ${JSON.stringify(new URL(path,new URL('../components/recipe-detail.tsx',import.meta.url)).href)}`);
const {RecipeDetail}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('rendered in-site recipe detail retains attribution without clickable source navigation',()=>{
 const recipe={...defaultRecipes()[0],source:'icook',sourceUrl:'https://icook.tw/recipes/123',author:'測試作者'};
 const html=renderToStaticMarkup(createElement(RecipeDetail,{recipe}));
 assert.match(html,/番茄炒蛋/);
 assert.match(html,/來源：iCook 愛料理/);
 assert.match(html,/測試作者/);
 assert.match(html,/來源用量/);
 assert.match(html,/作法/);
 assert.doesNotMatch(html,/<(?:a|area)\b[^>]*\bhref\s*=/i);
 assert.doesNotMatch(html,/\b(?:href|action|formaction)="https?:/i);
});
