const {DatabaseSync}=require('node:sqlite');
const crypto=require('node:crypto');
const catalog=require('../data/places.json');
const ids=new Set(catalog.map(x=>x.id));
const secret=()=>crypto.randomBytes(32).toString('base64url');
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
function fail(status,message){throw Object.assign(new Error(message),{status});}
function name(value){if(typeof value!=='string'||!value.trim()||value.length>40)fail(400,'Enter a name of 1–40 characters.');return value.trim();}
const {validateTrip}=require('../supabase/functions/sori-trips/validation.js');
function plan(value){try{return validateTrip(value,catalog);}catch(e){fail(400,e.message);}}
function createTripsApi(filename=':memory:',clock=Date.now){
 const db=new DatabaseSync(filename);db.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS trips(id TEXT PRIMARY KEY,plan TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS members(id TEXT PRIMARY KEY,trip TEXT NOT NULL REFERENCES trips(id),name TEXT NOT NULL,role TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,active INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS invites(hash TEXT PRIMARY KEY,trip TEXT NOT NULL REFERENCES trips(id),expires INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS comments(id TEXT PRIMARY KEY,trip TEXT NOT NULL REFERENCES trips(id),member TEXT NOT NULL REFERENCES members(id),body TEXT NOT NULL,created TEXT NOT NULL);
 `);
 const get=(sql,...args)=>db.prepare(sql).get(...args),run=(sql,...args)=>db.prepare(sql).run(...args),all=(sql,...args)=>db.prepare(sql).all(...args);
 const transaction=fn=>{db.exec('BEGIN IMMEDIATE');try{const v=fn();db.exec('COMMIT');return v;}catch(e){db.exec('ROLLBACK');throw e;}};
 const member=(id,token)=>{const m=get('SELECT * FROM members WHERE trip=? AND token_hash=? AND active=1',id,hash(token));if(!m)fail(401,'This trip needs a valid invitation or membership.');return m;};
 const snapshot=id=>{const trip=get('SELECT * FROM trips WHERE id=?',id);return {id,plan:JSON.parse(trip.plan),version:trip.version,members:all('SELECT id,name,role FROM members WHERE trip=? AND active=1 ORDER BY rowid',id),comments:all('SELECT c.id,c.body,c.created,m.name FROM comments c JOIN members m ON c.member=m.id WHERE c.trip=? ORDER BY c.rowid DESC LIMIT 60',id)};};
 const limit=new Map();
 async function handle(req,res){
  const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/api/'))return false;
  const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
  try{
   if(url.pathname==='/api/health'){reply(200,{mode:'development',collaboration:true});return true;}
   let body={};if(!['GET','HEAD'].includes(req.method)){
    let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>24000)fail(413,'Request too large.');}
    try{body=JSON.parse(text||'{}');}catch{fail(400,'Invalid JSON.');}
   }
   if(req.method==='POST'&&url.pathname==='/api/trips'){
    const ip=req.socket.remoteAddress,now=clock();let rate=limit.get(ip);if(!rate||rate.until<now){rate={until:now+3600000,count:0};limit.set(ip,rate);}if(++rate.count>20)fail(429,'Too many trips. Please try later.');
    const id=crypto.randomUUID(),token=secret(),mid=crypto.randomUUID(),p=plan(body.plan),n=name(body.name);
    transaction(()=>{run('INSERT INTO trips(id,plan) VALUES(?,?)',id,JSON.stringify(p));run('INSERT INTO members(id,trip,name,role,token_hash) VALUES(?,?,?,?,?)',mid,id,n,'owner',hash(token));});
    reply(201,{trip:snapshot(id),memberToken:token,memberId:mid});return true;
   }
   if(req.method==='POST'&&url.pathname==='/api/invitation'){
    const inv=get('SELECT * FROM invites WHERE hash=? AND used=0 AND expires>?',hash(String(body.invite||'')),clock());if(!inv)fail(410,'This invitation expired or was already used. Ask for a new link.');
    reply(200,{tripId:inv.trip});return true;
   }
   if(req.method==='POST'&&url.pathname==='/api/join'){
    const n=name(body.name),token=secret(),mid=crypto.randomUUID();const invitation=String(body.invite||'');if(invitation.length>100)fail(400,'Invalid invitation.');
    const id=transaction(()=>{const inv=get('SELECT * FROM invites WHERE hash=? AND used=0 AND expires>?',hash(invitation),clock());if(!inv)fail(410,'This invitation expired or was already used. Ask for a new link.');if(get('SELECT count(*) AS n FROM members WHERE trip=? AND active=1',inv.trip).n>=8)fail(409,'This trip already has eight people.');run('UPDATE invites SET used=1 WHERE hash=?',hash(invitation));run('INSERT INTO members(id,trip,name,role,token_hash) VALUES(?,?,?,?,?)',mid,inv.trip,n,'guest',hash(token));run('UPDATE trips SET version=version+1 WHERE id=?',inv.trip);return inv.trip;});
    reply(201,{trip:snapshot(id),memberToken:token,memberId:mid});return true;
   }
   const match=url.pathname.match(/^\/api\/trips\/([a-f0-9-]{36})(?:\/(invites|comments|members)(?:\/([a-f0-9-]{36}))?)?$/);if(!match)fail(404,'Not found.');
   const [,id,action,target]=match;const auth=req.headers.authorization||'';const m=member(id,auth.startsWith('Bearer ')?auth.slice(7):'');
   if(req.method==='GET'&&!action){reply(200,snapshot(id));return true;}
   if(req.method==='PATCH'&&!action){const p=plan(body.plan);const changed=run('UPDATE trips SET plan=?,version=version+1 WHERE id=? AND version=?',JSON.stringify(p),id,body.version);if(!changed.changes)fail(409,'A friend changed this trip. Reload and try your change again.');reply(200,snapshot(id));return true;}
   if(req.method==='POST'&&action==='invites'){
    if(m.role!=='owner')fail(403,'Only the trip creator can invite people.');if(get('SELECT count(*) AS n FROM invites WHERE trip=? AND used=0 AND expires>?',id,clock()).n>=20)fail(409,'There are already enough active invitations for this trip.');const invite=secret();run('INSERT INTO invites(hash,trip,expires) VALUES(?,?,?)',hash(invite),id,clock()+7*86400000);reply(201,{invite});return true;
   }
   if(req.method==='DELETE'&&action==='invites'){
    if(m.role!=='owner')fail(403,'Only the creator can cancel invitations.');run('UPDATE invites SET used=1 WHERE trip=? AND used=0',id);reply(200,{ok:true});return true;
   }
   if(req.method==='POST'&&action==='comments'){
    if(typeof body.body!=='string'||!body.body.trim()||body.body.length>500)fail(400,'Write a comment of 1–500 characters.');
    if(get('SELECT count(*) AS n FROM comments WHERE trip=?',id).n>=200)fail(409,'Comment limit reached for this trip.');
    transaction(()=>{run('INSERT INTO comments(id,trip,member,body,created) VALUES(?,?,?,?,?)',crypto.randomUUID(),id,m.id,body.body.trim(),new Date().toISOString());run('UPDATE trips SET version=version+1 WHERE id=?',id);});reply(201,snapshot(id));return true;
   }
   if(req.method==='DELETE'&&action==='members'&&target){if(m.role!=='owner')fail(403,'Only the creator can remove a guest.');const changed=run("UPDATE members SET active=0 WHERE id=? AND trip=? AND role='guest'",target,id);if(!changed.changes)fail(404,'Guest not found.');run('UPDATE trips SET version=version+1 WHERE id=?',id);reply(200,snapshot(id));return true;}
   fail(405,'Method not allowed.');
  }catch(error){reply(error.status||500,{error:error.status?error.message:'Server error. Please try again.'});}return true;
 }
 return {handle,close:()=>db.close()};
}
module.exports={createTripsApi};
