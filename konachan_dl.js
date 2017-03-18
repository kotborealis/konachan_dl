'use strict';
const fs = require('fs');
const join_path = require('path').join;
const request = require('request');
const ProgressBar = require('progress');

function konachanPageImages(tag, page, cb){
    const url = `http://konachan.net/post.json?tags=${tag}&page=${page}`;
    request(url, (err, res, body) => {
        if(err || res.statusCode !== 200){
            throw new Error("Error loading page" + url);
        }
        const images = JSON.parse(body).map(i => i.file_url);
        cb(images);
    });
}

function konachanPageSaveImages(path, tag, page){
    console.log(`[Page ${page}] ${tag}`);
    const cb = (images) => {
        const loop = (i) => {
            if(i === images.length){
                konachanPageSaveImages(path, tag, page + 1);
            }
            else{
                const image = images[i];
                const image_name = decodeURI(image.split('/').pop()).replace(/"|'/g, '~');
                const file_path = join_path(`${path}/${image_name}`);
                console.log(`[Page ${page}] Saving ${image_name}`);
                try{
                    fs.accessSync(file_path, fs.constants.F_OK);
                    console.log(`[Page ${page}] ${image_name} already exists, skipping`);
                    loop(i + 1);
                }
                catch(e){
                    let progress;
                    const stream = request('http:' + image)
                        .on('response', res => {
                            progress = new ProgressBar('[:bar] :etas', {
                                complete: '=',
                                incomplete: ' ',
                                width: 20,
                                total: parseInt(res.headers['content-length'])
                            });
                        })
                        .on('data', data => {
                            progress.tick(data.length);
                        })
                        .pipe(fs.createWriteStream(file_path));
                    stream.on('finish',() => loop(i + 1));
                }
            }
        };
        loop(0);
    };
    konachanPageImages(tag, page, cb);
}

module.exports = konachanPageSaveImages;
