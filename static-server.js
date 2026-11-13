const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer((request,response)=>{
 const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
 const target = path.resolve(root,`.${pathname}`);
 if(!target.startsWith(root)){response.writeHead(403).end();return;}
 const file=fs.existsSync(target)&&fs.statSync(target).isFile()?target:path.join(root,'index.html');
 response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(response);
});
const port=Number(process.env.PORT)||4173;
server.listen(port,()=>console.log(`Static portfolio at http://localhost:${port}`));
