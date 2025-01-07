import {Jimp} from 'jimp'
import {createCanvas} from 'canvas';
import {getDocument, GlobalWorkerOptions} from "pdfjs-dist";

GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export async function PDFtoIMG(PDFfile: string){
    const dataList = [];
    const pdfDocumentLoadingTask = getDocument(PDFfile);
    //const canvas = createCanvas();
    const pdfDocument = await pdfDocumentLoadingTask.promise;
    for (let i = 0; i < pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i + 1);
        const pageViewport = page.getViewport({scale: 4}); //page quality
        const canvas = createCanvas(pageViewport.width, pageViewport.height);
        console.log(pageViewport.height, pageViewport.height)
        const ctx = canvas.getContext("2d");
        const pageRenderTask = page.render({canvasContext: ctx, viewport: pageViewport});
        await pageRenderTask.promise;
        console.log(canvas.toDataURL('image/png'));
        dataList.push(canvas.toDataURL('image/png'));
    }
    return dataList;
}

/*async function ImageConverter(imageList: Buffer[]){
    for (const image of imageList){
        sharp(image)
    }
    const img1 = await Jimp.read(await fetch(test1).then(res => res.arrayBuffer()));
    const img2 = await Jimp.read(await fetch(test2).then(res => res.arrayBuffer()));
    const background = new Jimp({ width: 1200, height: 1200, color:0xffffffff});
    background.composite(img1, 0, 0);
    background.composite(img2, 100, 150);
    return await background.getBuffer("image/png");
}*/

export async function CanvasLayout(imageList: string[]) {
    const background = new Jimp({ width: 3508, height: 2480, color:0xffffffff })
    const partWidth=background.width/4;
    const partHeight=background.height/2;
    for (let i=0;i<8;i++){
        if (imageList[i] == undefined) continue;
        const imgFetch = await fetch(imageList[i]);
        const imgBuffer = await imgFetch.arrayBuffer();
        const img = await Jimp.read(imgBuffer);
        let x, y;
        img.resize({ w: partWidth, h: partHeight });
        if (i>0 && i<5) {
            y=0;
            x=partWidth*(i-1);
        }
        else {
            img.rotate(180);
            y=partHeight;
            if (i==0)
                x=0;
            else x=partWidth*(8-i); //5=3, 6=2, 7=1
        }
        background.composite(img, x, y); //TODO: add x and y testing if they're not undefined
    }
    background.rotate(90);
    return background.getBuffer("image/png");
}
