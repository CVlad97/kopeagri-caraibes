const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const s=fs.readFileSync('src/pages/PartnerRegistrationPage.tsx','utf8');
test('partner can sign in without a password with a verified email',()=>{
 assert.match(s,/mode==='magic'/);
 assert.match(s,/signInWithOtp/);
 assert.match(s,/shouldCreateUser:false/);
 assert.match(s,/Connexion par email sans mot de passe/);
});
test('partner magic email retains the approved redirect',()=>assert.match(s,/emailRedirectTo:redirect\(\)/));
