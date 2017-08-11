
import world from './world';
import DcmImageInfo from './DcmImageInfo'

let showImgInfo = (dcmImage) => {
    console.log(dcmImage);
    let tbLog = document.getElementById("show-log");
    for (let prop in dcmImage) {
        if (prop === "pRGBAImg") continue;
        tbLog.value += dcmImage[prop] + "\n";
    }
}

var MyWorker = require("worker-loader!./getJsonImage.js");
let worker = new MyWorker();

//let worker = new Worker('worker.js');
worker.onmessage = (evt) => {
    worker.terminate;
    
    console.log(evt.data);
    document.getElementById('another-output')
        .innerHTML = `dcmImage id: ${evt.data.nWinWidth}!`; 
       
    let dcmImage = new DcmImageInfo();
    for (let prop in evt.data)
        dcmImage[prop] = evt.data[prop];

    setTimeout(showImgInfo, 1000, dcmImage);
    //console.log(dcmImage);
};

worker.postMessage({ 
    tag: 0, 
    id: "1.2.392.200036.9116.2.5.1.37.2417546889.1390451012.523936" 
});

document.getElementById('output').innerHTML = `Hello ${world}!`;
//document.getElementById('another-output').innerHTML = `dcmImage id: ${dcmImage.imgId}!`;