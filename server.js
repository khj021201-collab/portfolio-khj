const express = require('express');
const path = require('node:path');
const { createApp, databasePath, queryCategories, queryExperiences } = require('./scripts/database');

const app = express();
const port = Number(process.env.PORT) || 3000;
app.disable('x-powered-by');
let databaseReady;

app.use(async (_request,_response,next)=>{try{await databaseReady;next();}catch(error){next(error);}});
app.get('/api/health',(_request,response)=>response.json({ok:true,database:'sqlite',engine:'sqlite3-cli'}));
app.get('/api/experiences',async(request,response,next)=>{
 try {const category=typeof request.query.category==='string'?request.query.category:'all';const search=typeof request.query.q==='string'?request.query.q.trim().slice(0,80):'';response.json({experiences:await queryExperiences(databasePath,category,search)});}catch(error){next(error);}
});
app.get('/api/categories',async(_request,response,next)=>{try{response.json({categories:await queryCategories(databasePath)});}catch(error){next(error);}});
app.use(express.static(path.join(__dirname,'public'),{extensions:['html']}));
app.get('*path',(_request,response)=>response.sendFile(path.join(__dirname,'public','index.html')));
async function start(){await createApp();databaseReady=Promise.resolve();return app.listen(port,()=>console.log(`Portfolio server running at http://localhost:${port}`));}
module.exports={app,start};
if(require.main===module){databaseReady=createApp().then(()=>undefined);databaseReady.then(()=>app.listen(port,()=>console.log(`Portfolio server running at http://localhost:${port}`))).catch(error=>{console.error(error);process.exitCode=1;});}
