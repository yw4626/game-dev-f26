'use strict';
const {execFile}=require('node:child_process'),{promisify}=require('node:util');
const execFileAsync=promisify(execFile);
async function loadToken(){
 try{
  const {stdout}=process.platform==='win32'?await execFileAsync('powershell.exe',['-NoProfile','-NonInteractive','-Command','& gcloud auth application-default print-access-token'],{timeout:45000,windowsHide:true}):await execFileAsync('gcloud',['auth','application-default','print-access-token'],{timeout:45000});
  const token=stdout.trim();if(!token)throw Error();return token;
 }catch(e){throw Object.assign(Error('Vertex credential preparation failed'),{code:e.killed?'credential_timeout':'authentication_error'});}
}
function createVertexAuth({loader=loadToken,now=Date.now,refreshMs=45*60*1000}={}){
 const cache=new Map(),pending=new Map();
 return {async token(project){
  const old=cache.get(project);if(old&&now()<old.expires)return old.token;
  if(!pending.has(project))pending.set(project,(async()=>{try{const token=await loader();if(typeof token!=='string'||!token.trim())throw Object.assign(Error('Empty credential'),{code:'authentication_error'});cache.set(project,{token,expires:now()+refreshMs});return token;}finally{pending.delete(project);}})());
  return pending.get(project);
 }};
}
module.exports={createVertexAuth,sharedVertexAuth:createVertexAuth()};
