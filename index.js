#! /usr/bin/env node
const fs = require('fs');
const konachan_dl = require("./konachan_dl");

if(process.argv.length < 5){
    console.log("usage: konachan_dl /path/to/save/dir/ tag starting_page");
}
else{
    const [path, tag] = process.argv.slice(2);
    fs.accessSync(path,fs.constants.W_OK);

    let starting_page = parseInt(process.argv[4]);
    if(Number.isNaN(starting_page))
        starting_page = 0;

    konachan_dl(path, tag, starting_page);
}