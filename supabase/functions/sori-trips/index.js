import {createHandler} from './handler.js';
import catalog from './catalog.json' with {type:'json'};
const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');
const key=keys.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!key)throw Error('Missing server database credential.');
Deno.serve(createHandler({url:Deno.env.get('SUPABASE_URL'),key,catalog}));
