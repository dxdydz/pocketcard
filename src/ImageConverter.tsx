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
        //console.log(pageViewport.height, pageViewport.height)
        const ctx = canvas.getContext("2d");
        const pageRenderTask = page.render({canvasContext: ctx, viewport: pageViewport});
        await pageRenderTask.promise;
        //console.log(canvas.toDataURL('image/png'));
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

type JimpInstance = Awaited<ReturnType<typeof Jimp.read>>; //Jimp bug workaround

interface LayoutPage {
    page: number,
    isReversed?: boolean;
}

interface Layouts {
    method: string;
    data: LayoutPage[];
}

const Layouts: Layouts[] = [
    { method: "Pocketmod",
    data: [
        {page: 2},
        {page: 3},
        {page: 4},
        {page: 5},
        {page: 1, isReversed: true},
        {page: 8, isReversed: true},
        {page: 7, isReversed: true},
        {page: 6, isReversed: true}
    ]},
    { method: "Pocketfold",
        data: [
            {page: 7, isReversed: true},
            {page: 6, isReversed: true},
            {page: 5, isReversed: true},
            {page: 4, isReversed: true},
            {page: 3},
            {page: 8},
            {page: 1},
            {page: 2}
        ]}
]

export async function CanvasLayout(imageList: string[], layout: string|null) {
    const background = new Jimp({ width: 3508, height: 2480, color:0xffffffff })
    const partWidth=background.width/4;
    const partHeight=background.height/2;
    const sortedLayout=[];
    const pageData=Layouts.find((value: Layouts)=>(value.method===layout));
    if (pageData===undefined) return; //TODO: Replace with proper error handling
    for (let i=0;i<pageData.data.length;i++){
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
        background.composite(img, x, y); //TODO: add x and y testing if they're not undefined
    }
    background.rotate(90);
    return background.getBuffer("image/png");
}

function RowLayout(partWidth: number, partHeight: number, rowLength: number, i: number){
    const x=partWidth*(i%rowLength);
    const y=partHeight*Math.floor(i/rowLength);
    return [x, y];
}