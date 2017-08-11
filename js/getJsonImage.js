
import DcmImageInfo from './DcmImageInfo'

importScripts('twix.min.js'); 

self.onmessage = (evt) => {
    console.log(evt.data);

    Twix.ajax({
        url: "http://localhost:8090/image/file/" + evt.data.id,
        type: "GET",
        error: function (err) {
            console.log(err);
        },
        success: function(data) {
            let obj = JSON.parse(data);
            //console.log(obj);
            //self.postMessage(data);
            let dcmImage = new DcmImageInfo();
            dcmImage.tag = evt.data.tag;
            dcmImage.imgId = evt.data.id;
            dcmImage.setFromJson(obj);
            self.postMessage(dcmImage);
        }
    });
};