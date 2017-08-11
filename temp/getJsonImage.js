
importScripts('twix.min.js'); 

const DCMTAG_ROWS                   = "00280010";  
const DCMTAG_COLUMNS                = "00280011";  
const DCMTAG_BITS_ALLOCATED         = "00280100";  
const DCMTAG_BITS_STORED            = "00280101";  
const DCMTAG_HIGH_BIT               = "00280102";  
const DCMTAG_PIXEL_REPRESENTATION   = "00280103";
const DCMTAG_WINDOW_CENTER          = "00281050";  
const DCMTAG_WINDOW_WIDTH           = "00281051";  
const DCMTAG_RESCALE_INTERCEPT      = "00281052";  
const DCMTAG_RESCALE_SLOPE          = "00281053";
const DCMTAG_PIXEL_DATA             = "7FE00010";

class DicomImageInfo {
    constructor() {
        this.tag = -1;
        this.imgId = "";

        this.bIsLoadedImage = false;
        this.nWidth = 0;
        this.nHeight = 0;
        this.nWinWidth = 0;
        this.nWinCenter = 0;
        this.dSlope = 1.0;
        this.dIntercept = 0.0;
        this.nMinPixVal = 0;
        this.nPixelRep = 0;
        this.dZoomRatio = 1.0;

        this.pRGBAImg = null; // ArrayBuffer
    }

    static __base64ToArrayBuffer(base64) {
        let binary_string = atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array( len );
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    setMinPixelValue(pRawBuf) {
        let len = pRawBuf.length;
        for (let i = 0; i < len; ++i) {
            if (pRawBuf[i] < this.nMinPixVal)
                this.nMinPixVal = pRawBuf[i];
        }
    }

    setFromJson(dcmJson) {
        this.nWidth = dcmJson[DCMTAG_COLUMNS].Value[0];
        this.nHeight = dcmJson[DCMTAG_ROWS].Value[0];
        this.nWinWidth = dcmJson[DCMTAG_WINDOW_WIDTH].Value[0];
        this.nWinCenter = dcmJson[DCMTAG_WINDOW_CENTER].Value[0];
        this.dSlope = dcmJson[DCMTAG_RESCALE_SLOPE] 
                        ? dcmJson[DCMTAG_RESCALE_SLOPE].Value[0] : 1.0;
        this.dIntercept = dcmJson[DCMTAG_RESCALE_INTERCEPT] 
                        ? dcmJson[DCMTAG_RESCALE_INTERCEPT].Value[0] : 0.0;
        this.nPixelRep = dcmJson[DCMTAG_PIXEL_REPRESENTATION] 
                        ? dcmJson[DCMTAG_PIXEL_REPRESENTATION].Value[0] : 0;

        this.loadImage(dcmJson[DCMTAG_PIXEL_DATA].InlineBinary);
    }

    loadImage(base64) {
        let buffer = DicomImageInfo.__base64ToArrayBuffer(base64);
        let pRawBuf = new Int16Array(buffer);
        if (this.nPixelRep === 1) {
            this.setMinPixelValue(pRawBuf);
        }
        this.bIsLoadedImage = this.setRGBAImg(pRawBuf);
    }

    setRGBAImg (rawImg) {
        if (this.nWidth === 0 || this.nHeight === 0) {
            return false;
        }

        let base = 0, start = 0;
    
        this.pRGBAImg = new Uint8Array(this.nWidth * 4 * this.nHeight);
        for (let y = 0; y < this.nHeight; y++) {
            for (let x = 0; x < this.nWidth; x++) {
                base = y * this.nWidth + x;
                start = base * 4;

                if (this.nMinPixVal < 0) {
                    rawImg[base] += this.nMinPixVal * -1;
                }
                this.pRGBAImg[start + 0] = rawImg[base] & 0x00ff;
                this.pRGBAImg[start + 1] = (rawImg[base] >> 8);
                this.pRGBAImg[start + 2] = 0;
                this.pRGBAImg[start + 3] = 255;
            }
        }
        this.dIntercept += this.nMinPixVal < 0 ? this.nMinPixVal : 0;
        return true;
    }
}

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
            let dcmImage = new DicomImageInfo();
            dcmImage.tag = evt.data.tag;
            dcmImage.imgId = evt.data.id;
            dcmImage.setFromJson(obj);
            self.postMessage(dcmImage);
        }
    });
};