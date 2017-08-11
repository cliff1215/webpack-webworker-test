
import world from './world';
import DcmImageInfo from './DcmImageInfo'

//let dcmImage = new DcmImageInfo();
// dcmImage.tag = 0;
// dcmImage.imgId = "1.3.12.2.1107.5.2.19.45046.2014012218250940925549808";

let showImgInfo = (dcmImage) => {
    console.log(dcmImage);
    let tbLog = document.getElementById("show-log");
    for (let x in dcmImage) {
        if (x === "pRGBAImg") continue;

        tbLog.value += dcmImage[x] + "\n";
    }
}

var MyWorker = require("worker-loader!./getJsonImage.js");
let worker = new MyWorker();

//let worker = new Worker('worker.js');
worker.onmessage = (evt) => {
    worker.terminate;
    //console.log(evt.data);
    document.getElementById('another-output').innerHTML = `dcmImage id: ${evt.data.nWinWidth}!`; 
       
    let dcmImage = new DcmImageInfo();

    dcmImage.tag = evt.data.tag;
    dcmImage.imgId = evt.data.imgId;
    dcmImage.bIsLoadedImage = evt.data.bIsLoadedImage;
    dcmImage.nWidth = evt.data.nWidth;
    dcmImage.nHeight = evt.data.nHeight;
    dcmImage.nWinWidth = evt.data.nWinWidth;
    dcmImage.nWinCenter = evt.data.nWinCenter;
    dcmImage.dSlope = evt.data.dSlope;
    dcmImage.dIntercept = evt.data.dIntercept;
    dcmImage.nMinPixVal = evt.data.nMinPixVal;
    dcmImage.nPixelRep = evt.data.nPixelRep;
    dcmImage.dZoomRatio = evt.data.dZoomRatio;
    dcmImage.pRGBAImg = evt.data.pRGBAImg;

    setTimeout(showImgInfo, 1000, dcmImage);
    //console.log(dcmImage);
};
let argData = { 
        tag: 0, 
        id: "1.2.392.200036.9116.2.5.1.37.2417546889.1390451012.523936" 
};
worker.postMessage(argData);

document.getElementById('output').innerHTML = `Hello ${world}!`;
//document.getElementById('another-output').innerHTML = `dcmImage id: ${dcmImage.imgId}!`;