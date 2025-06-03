import http from 'http';
import fs, { writeFile } from 'fs';
import url from 'url';
import path from 'path';

const __filename=url.fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const PORT=3003;

const urlInfoPath=path.join(__dirname,'urlInfo.json')



const urlInfo=async ()=>{
    
    try{
        const urlData=await fs.promises.readFile(urlInfoPath,'utf-8');
        return JSON.parse(urlData);

    }
    catch (error){
        if (error.code==='ENOENT'){
            await fs.promises.writeFile(urlInfoPath,JSON.stringify({}));
            return {}
        }
        throw error
    }

}


const urlInfoSave=async (urlDeta)=>{
    await fs.promises.writeFile(urlInfoPath,JSON.stringify(urlDeta,null,2))
}





const server=http.createServer(
    async (req,res)=>{
        if (req.method==='GET'){ 
            if (req.url==='/'){ 

                try{
                    const data=await fs.promises.readFile(path.join(__dirname,'public','index.html'));
                    res.writeHead(200,{'Content-Type':'text/html'});
                    res.end(data)
                }
                catch (err){
                    res.writeHead(404,{'Content-Type':'text/html'});
                    res.end('404 page not found')
                }



            }
            else if (req.url==='/style.css'){
    
                    try{
                        const data=await fs.promises.readFile(path.join(__dirname,'public','style.css'));
                        res.writeHead(200,{'Content-Type':'text/css'});
                        res.end(data)
                    }
                    catch (err){
                        res.writeHead(404,{'Content-Type':'text/html'});
                        res.end('404 page not found')
                    }
    
    
    
                }
                else if (req.url==='/urls'){
                    try{
                        const urlDeta=await urlInfo();
                        res.writeHead(200,{'Content-Type':'application/json'});
                        res.end(JSON.stringify(urlDeta));
                    }
                    catch(error){
                        res.writeHead(500,{'Content-Type':'application/json'});
                        res.end(JSON.stringify({message:'Server Error', error:error.message}))
                    }
                }
                else{
                    const links=await urlInfo();
                    const shortCode=req.url.slice(1);
                    if (links[shortCode]){
                        res.writeHead(302,{location:links[shortCode]});
                        return res.end();
                    }
                    res.writeHead(404,{'Content-Type':'text/plain'});
                    return res.end('URL not found!')
                }
        }


        if (req.method==='POST' && req.url==='/submit'){
            const urlDeta=await urlInfo();
            let rawData='';
            req.on('data',
                (chunk)=>{
                    rawData+=chunk;
                }
            )
            req.on('end',
                async ()=>{
                    const {shortCode,url}=JSON.parse(rawData);
                    
                    
                    // if (!url){
                    //     res.writeHead(400,{'Content-Type':'text/plain'});
                    //     return res.end('URL is required.');
                    // }


                    if (urlDeta[shortCode]){
                        res.writeHead(409,{'Content-Type':'application/json'});
                        return res.end(JSON.stringify({message:'URL already exist!'}))
                    }
                    urlDeta[shortCode]=url;
                    await urlInfoSave(urlDeta);
                    res.writeHead(200,{'Content-Type':'application/json'});
                    res.end(JSON.stringify({message:'Data Saved Successfully!'}));


                }
            )
           
        }
    }
        
        
    
);
server.listen(PORT,
    ()=>{
        console.log(`Server running at http://localhost:${PORT}`)
    }
)



// import http from 'http';
// import fs from 'fs';
// import path from 'path';

// const PORT = 3003;

// const server = http.createServer(async (req, res) => {
//   if (req.method === 'GET') {
//     if (req.url === '/') {
//       try {
//         const data = await fs.promises.readFile(path.join('public', 'index.html'));
//         res.writeHead(200, { 'Content-Type': 'text/html' });
//         res.end(data);
//       } catch (err) {
//         res.writeHead(404, { 'Content-Type': 'text/html' });
//         res.end('404 page not found');
//       }

//     } else if (req.url === '/style.css') {
//       try {
//         const data = await fs.promises.readFile(path.join('public', 'style.css'));
//         res.writeHead(200, { 'Content-Type': 'text/css' });
//         res.end(data);
//       } catch (err) {
//         res.writeHead(404, { 'Content-Type': 'text/html' });
//         res.end('404 page not found');
//       }

//     } else {
//       res.writeHead(404, { 'Content-Type': 'text/html' });
//       res.end('404 page not found');
//     }
//   }
// });

// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
