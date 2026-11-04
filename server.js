const express = require('express');
const path = require('node:path');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const { createApp, queryExperiences } = require('./scripts/database');

const app = express();
const port = Number(process.env.PORT) || 3000;
const databasePath = path.join(__dirname, 'data', 'portfolio.sqlite');
app.disable('x-powered-by');
let database;
let databaseReady;

app.use(async (_request, _response, next) => {
  try {
    await databaseReady;
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', (_request, response) => response.json({ok:true,database:'sqlite'}));
app.get('/api/experiences', (request, response) => {
  const category=typeof request.query.category==='string'?request.query.category:'all';
  const query=typeof request.query.q==='string'?request.query.q.trim().slice(0,80):'';
  response.json({experiences:queryExperiences(database,category,query)});
});
app.get('/api/categories', (_request,response) => {
  const result=database.prepare('SELECT DISTINCT category FROM experiences ORDER BY category').all();
  response.json({categories:result.map(({category})=>category)});
});
app.use(express.static(__dirname,{index:false,dotfiles:'ignore'}));
app.use(express.static(path.join(__dirname,'public'),{extensions:['html']}));
app.get('*path',(_request,response)=>response.sendFile(path.join(__dirname,'public','index.html')));

async function start() {
  const initialized=await createApp();
  database=initialized.database;
  databaseReady=Promise.resolve();
  const server=app.listen(port,()=>console.log(`Portfolio server running at http://localhost:${port}`));
  const persist=async()=>{
    await fs.writeFile(databasePath,Buffer.from(database.export()));
  };
  const shutdown=async()=>{
    server.close(async()=>{
      await persist();
      database.close();
      process.exit(0);
    });
  };
  process.once('SIGINT',shutdown);
  process.once('SIGTERM',shutdown);
  return server;
}

module.exports={app,start};
if(require.main===module){
  databaseReady=createApp().then(({database:db})=>{database=db;return db;});
  databaseReady.then(()=>app.listen(port,()=>console.log(`Portfolio server running at http://localhost:${port}`))).catch(error=>{console.error(error);process.exitCode=1;});
}
