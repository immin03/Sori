import readline from 'node:readline';import {spawnSync} from 'node:child_process';
console.log('Ready for repository credential JSON on stdin (input hidden).');
const rl=readline.createInterface({input:process.stdin,terminal:false});
const line=await new Promise(resolve=>rl.once('line',resolve));rl.close();
const credential=JSON.parse(line);
const env={...process.env,GIT_TERMINAL_PROMPT:'0',GIT_TRACE:'0',GIT_TRACE_CURL:'0'};
if(credential.auth_mode==='http_extra_header')Object.assign(env,{GIT_CONFIG_COUNT:'1',GIT_CONFIG_KEY_0:'http.extraHeader',GIT_CONFIG_VALUE_0:'Authorization: Bearer '+credential.token});
function git(args,ok=[0]){const r=spawnSync('git',args,{env,encoding:'utf8'});if(!ok.includes(r.status))throw Error(r.stderr.trim()||'Git failed.');return r.stdout.trim();}
git(['init','-b',credential.branch]);git(['config','user.name','Sori']);git(['config','user.email','sori.korea.official@gmail.com']);
git(['remote','add','origin',credential.remote_url],[0,3]);
const remote=git(['ls-remote','origin','refs/heads/'+credential.branch]);
if(remote){git(['fetch','origin',credential.branch]);const current=git(['rev-parse','--verify','HEAD'],[0,128]);if(current&&current!==remote.split(/\s/)[0])throw Error('Remote changed; inspect before updating.');if(!current)git(['reset','--mixed','FETCH_HEAD']);}
git(['add','.']);const commit=spawnSync('git',['diff','--cached','--quiet'],{env});if(commit.status===1)git(['commit','-m','Deploy Sori shared-trip API']);
const sha=git(['rev-parse','HEAD']);git(['push','-u','origin',credential.branch]);console.log(JSON.stringify({commit_sha:sha}));
