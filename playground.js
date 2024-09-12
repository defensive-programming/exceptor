/**
 * The goal of this file is trying to test the built result very quick from node env.
 * The workspace setting should already let it work out of Deno env,
 * but just in case, this file shouldn't be triggered via Deno in any way.
 */
const U = require('./npm/script/index.js');

console.log(U);