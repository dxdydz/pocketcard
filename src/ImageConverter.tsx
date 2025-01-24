import {Jimp} from 'jimp'
import {createCanvas} from 'canvas';
import {getDocument, GlobalWorkerOptions} from "pdfjs-dist";
import {Layout, LayoutPage, Layouts, PaperOptions, PaperOption, PaperType, LayoutType} from "./Layouts.tsx";

GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export async function PDFtoIMG(PDFfile: string){
    const dataList = [];
    const pdfDocumentLoadingTask = getDocument(PDFfile);
    const pdfDocument = await pdfDocumentLoadingTask.promise;
    for (let i = 0; i < pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i + 1);
        const pageViewport = page.getViewport({scale: 4}); //page quality
        const canvas = createCanvas(pageViewport.width, pageViewport.height);
        const ctx = canvas.getContext("2d");
        // @ts-expect-error node canvas doesn't support some properties
        const pageRenderTask = page.render({canvasContext: ctx, viewport: pageViewport});
        await pageRenderTask.promise;
        dataList.push(canvas.toDataURL('image/png'));
    }
    return dataList;
}

type JimpInstance = Awaited<ReturnType<typeof Jimp.read>>; //Jimp bug workaround

export async function CreateFoldable(imageList: string[], layout: LayoutType, paperSize: PaperType) {
    const paperSizeSelection = PaperOptions.find((value: PaperOption) => value.type === paperSize);
    if (paperSizeSelection==undefined) throw Error("Invalid paperSize");
    const background = new Jimp({ width: paperSizeSelection.data.width, height: paperSizeSelection.data.height, color:0xffffffff })
    const partWidth=background.width/4;
    const partHeight=background.height/2;
    const sortedLayout=[];

    const pageData=Layouts.find((value: Layout)=>(value.method===layout));
    if (pageData===undefined) return; //TODO: Replace with proper error handling
    const pageNumber = imageList.length > pageData.data.length ? pageData.data.length : imageList.length;
    for (let i=0;i<pageNumber;i++){
        const imgFetch = await fetch(imageList[i]);
        const imgBuffer = await imgFetch.arrayBuffer();
        const img: JimpInstance = await Jimp.read(imgBuffer);
        const page = pageData.data.find((value: LayoutPage)=>(value.page===i+1))
        if (page===undefined) return;
        if (page.isReversed)
            img.rotate(180);

        sortedLayout[pageData.data.indexOf(page)] = img;
    }
    for (let i=0;i<sortedLayout.length;i++){
        if (sortedLayout[i]===undefined) continue;
        const img: JimpInstance = sortedLayout[i];
        const [x, y] = RowLayout(partWidth, partHeight, 4, i)
        img.resize({ w: partWidth, h: partHeight });
        if (x===undefined||y===undefined) throw new Error("Invalid Layout.");
        background.composite(img, x, y);
    }
    background.rotate(90);
    return background.getBuffer("image/png");
}

function RowLayout(partWidth: number, partHeight: number, rowLength: number, i: number){
    const x=partWidth*(i%rowLength);
    const y=partHeight*Math.floor(i/rowLength);
    return [x, y];
}