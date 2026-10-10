/* Loads the app's own data files (foods, recipes, game data, word lists, parser, Arrow's model
   runtime) into one sandbox, so training uses exactly the code and words the app ships. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const JS=path.join(__dirname,'..','..','js');
module.exports=function loadApp(){
  const ctx={console,Math,Date,JSON,Set,Map,Object,Array,String,Number,RegExp,Error,TextDecoder,Float32Array,Int8Array,Uint8Array,DataView,setTimeout,clearTimeout,
    document:{documentElement:{dataset:{}},getElementById:()=>null,addEventListener(){}},matchMedia:()=>({matches:false,addEventListener(){}}),ACT:{},navigator:{}};
  ctx.window=ctx;vm.createContext(ctx);
  const files=['data.js','recipes.js','arrow-lex.js','foods.js','foodlog.js','arrow-nlu.js'];
  let src=`function todayStr(){return '2026-10-10'}function addDays(ds,n){const t=new Date(ds+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}const esc=s=>s;\n`;
  src+=files.map(f=>fs.readFileSync(path.join(JS,f),'utf8')).join('\n');
  src+=`\n;this.__app={FOODS,RECIPES,LADDERS,WARMUP,COOLDOWN,SHADOW_LEGENDS,FL_NUM,FL_UNIT_OF,FL_MEAL,AX_NUM,AX_EX,AX_TAB,AX_SHADOW,AX_KITCHEN,NLU:ArrowNLU,flParse};`;
  vm.runInContext(src,ctx);
  return ctx.__app;
};
