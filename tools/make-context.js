#!/usr/bin/env node
// npm run context → context.txt を生成する。
// 新規チャットに context.txt だけ渡せば、ゲームの仕様・構成・全ソースを把握して開発を続けられるようにするためのもの。
// 構成: ①AIへの案内 ②docs/SPEC.md(手書きの仕様書) ③ファイル一覧 ④全ファイルの中身(index.html の読み込み順)
// 依存なし(Node 標準のみ)。ソースを足しても自動で拾う。index.html に登録し忘れた js があれば警告する。
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),OUT=path.join(root,'context.txt');
const SKIP_DIR=new Set(['node_modules','.git']),SKIP_FILE=new Set(['context.txt','package-lock.json']),EXT=new Set(['.js','.html','.css','.md','.json']);
const SPEC='docs/SPEC.md';
const M='='.repeat(5); // 区切り記号。ソース内に区切りそのものを書かない(context.txt に載せたとき本物の区切りと混ざるため)

const rel=p=>path.relative(root,p).split(path.sep).join('/');
const walk=(d,o=[])=>{for(const n of fs.readdirSync(d).sort()){const p=path.join(d,n),s=fs.statSync(p);
 if(s.isDirectory()){if(!SKIP_DIR.has(n))walk(p,o)}else if(EXT.has(path.extname(n))&&!SKIP_FILE.has(n))o.push(rel(p))}return o};
const read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n').replace(/\s+$/,'')+'\n';

const all=walk(root);
const html=fs.existsSync(path.join(root,'index.html'))?read('index.html'):'';
const scripts=[...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m=>m[1]);   // 読み込み順=依存順
const warns=[];
for(const s of scripts)if(!fs.existsSync(path.join(root,s)))warns.push(`index.html が読み込む ${s} が存在しない`);
for(const f of all)if(f.startsWith('js/')&&!scripts.includes(f))warns.push(`${f} が index.html の <script> に登録されていない(動かない)`);
if(!fs.existsSync(path.join(root,SPEC)))warns.push(`${SPEC} が無い(仕様書。作ること)`);

// 並び: index.html, style.css, package.json, js(読み込み順)→その他js, test, tools, 残り。仕様書は別枠なので除く。
const rank=f=>{if(f==='index.html')return[0,0];if(f==='style.css')return[1,0];if(f==='package.json')return[2,0];
 const i=scripts.indexOf(f);if(i>=0)return[3,i];if(f.startsWith('js/'))return[4,0];if(f.startsWith('test/'))return[5,0];if(f.startsWith('tools/'))return[6,0];return[7,0]};
const files=all.filter(f=>f!==SPEC).sort((a,b)=>{const x=rank(a),y=rank(b);return x[0]-y[0]||x[1]-y[1]||a.localeCompare(b)});

const body=files.map(f=>`${M} FILE: ${f} ${M}\n${read(f)}`).join('\n');
const tree=files.map(f=>{const t=read(f);return `${f}  (${t.split('\n').length-1}行)`}).join('\n');
const spec=fs.existsSync(path.join(root,SPEC))?read(SPEC):'(docs/SPEC.md が無い)\n';
const now=new Date(Date.now()+9*3600e3).toISOString().replace('T',' ').slice(0,16)+' JST';

const guide=`【このファイルの使い方】(AIへ)
これは「Wrecking Crew-like」(ブラウザの2Dアクションゲーム)の開発引き継ぎ資料です。あなたはこの続きを開発します。
1. 第1部の仕様書を最後まで読む(設計・確定仕様・作業ルールが書いてある。ここが一次資料)。
2. 第3部の全ソースを読む。コードと仕様書が食い違ったらコードが正。直す前に必ず該当ファイルの現物を確認する。
3. ユーザーの依頼は口語で曖昧なことが多い。解釈が割れる所は解釈を明記して実装し、返答の最後に一言確認する。
4. 実行環境(Node/ブラウザ)があるなら、変更後に \`npm test\` を通し、動く一式を zip で返す。無いなら変更ファイルを全文で出す。
5. 仕様を変えたら docs/SPEC.md も更新し、ユーザーに「npm run context で context.txt を作り直してね」と伝える。
(ユーザー側: プロジェクト直下で \`npm run context\` を実行すると、このファイルが最新のソースから再生成されます)
`;

const out=`${guide}
生成: ${now} / ファイル ${files.length + 1} 個
${warns.length?'\n【警告】\n'+warns.map(w=>'- '+w).join('\n')+'\n':''}
################################################################
# 第1部: 仕様書 (${SPEC})
################################################################
${spec}
################################################################
# 第2部: ファイル一覧(第3部の掲載順)
################################################################
${SPEC}  (第1部に掲載)
${tree}

################################################################
# 第3部: 全ソース
################################################################
${body}
${M} END OF CONTEXT ${M}
`;
fs.writeFileSync(OUT,out);
const kb=(Buffer.byteLength(out)/1024).toFixed(1);
console.log(`context.txt を作成: ${files.length+1} ファイル / ${out.length.toLocaleString()} 文字 (${kb} KB)`);
warns.forEach(w=>console.warn('警告: '+w));
