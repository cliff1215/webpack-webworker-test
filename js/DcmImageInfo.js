//
// Dicom Image Information
//
import * as DicomTag from './DicomTag';

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
        this.nWidth = dcmJson[DicomTag.COLUMNS].Value[0];
        this.nHeight = dcmJson[DicomTag.ROWS].Value[0];
        this.nWinWidth = dcmJson[DicomTag.WINDOW_WIDTH].Value[0];
        this.nWinCenter = dcmJson[DicomTag.WINDOW_CENTER].Value[0];
        this.dSlope = dcmJson[DicomTag.RESCALE_SLOPE] 
                        ? dcmJson[DicomTag.RESCALE_SLOPE].Value[0] : 1.0;
        this.dIntercept = dcmJson[DicomTag.RESCALE_INTERCEPT] 
                        ? dcmJson[DicomTag.RESCALE_INTERCEPT].Value[0] : 0.0;
        this.nPixelRep = dcmJson[DicomTag.PIXEL_REPRESENTATION] 
                        ? dcmJson[DicomTag.PIXEL_REPRESENTATION].Value[0] : 0;

        this.loadImage(dcmJson[DicomTag.PIXEL_DATA].InlineBinary);
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

    getLowUpVal() {
        if (!this.bIsLoadedImage) {
            return null;
        }
        
        let winCen = (this.nWinCenter - this.dIntercept) / this.dSlope;
        let dbHalf = (this.nWinWidth / this.dSlope) / 2.0;
        return {
            lower: Math.floor(winCen - dbHalf),
            upper: Math.floor(winCen + dbHalf)
        };
    }

    getCurrScaleX() {
        return (this.nHeight > this.nWidth
                ? 2.0 * this.nWidth / this.nHeight
                : 2.0) * this.dZoomRatio;
    }

    getCurrScaleY() {
        return (this.nWidth > this.nHeight
                ? 2.0 * this.nHeight / this.nWidth
                : 2.0) * this.dZoomRatio;
    }

    changeWinWidth(difference) {
        this.nWinWidth += difference;
        if (this.nWinWidth < 0) 
            this.nWinWidth = 0;
    }

    changeWinCenter(difference) {
        this.nWinCenter += difference;
    }

    changeZoomRatio(difference) {
        this.dZoomRatio += difference;
        if (difference < 0 && this.dZoomRatio < 1.0)
            this.dZoomRatio = 1.0;
    }
}

export default DicomImageInfo;