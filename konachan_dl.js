'use strict';
const fs = require('fs');
const request = require('request');

function konachanPageImages(tag,page,cb){
    const url = `http://konachan.com/post.json?tags=${tag}&page=${page}`;
    request(url,(err,res,body)=>{
        if(err || res.statusCode!== 200){
            throw new Error("Error loading page" + url);
        }
        const images = JSON.parse(body).map(i=>i.file_url);
        cb(images);
    });
}

function konachanPageSaveImages(path,tag,page){
    console.log(`[Page ${page}] ${tag}`);
    const cb = (images)=>{
        const loop = (i)=>{
            if(i==images.length){
                konachanPageSaveImages(path,tag,page+1);
            }
            else{
                const image_name = decodeURI(images[i].split('/').pop());
                console.log(`[Page ${page}] Saving ${image_name}`);
                try{
                    fs.accessSync(path+image_name,fs.constants.F_OK);
                    console.log(`[Page ${page}] ${image_name} already exists, skipping`);
                    loop(i+1);
                }
                catch(e){
                    const stream = request(images[i]).pipe(fs.createWriteStream(path+image_name));
                    stream.on('finish',()=>loop(i+1));
                }
            }
        };
        loop(0);
    };
    konachanPageImages(tag,page,cb);
}

module.exports = konachanPageSaveImages;