import {Jimp} from 'jimp'
import test1 from './assets/test-button.jpg';
import test2 from './assets/test-2.jpeg';

async function ImageConverter(/*imageList: Buffer[]*/){
    /*for (const image of imageList){
        sharp(image)
    }*/
    const img1 = await Jimp.read(await fetch(test1).then(res => res.arrayBuffer()));
    const img2 = await Jimp.read(await fetch(test2).then(res => res.arrayBuffer()));
    const background = new Jimp({ width: 1200, height: 1200, color:0xffffffff});
    background.composite(img1, 0, 0);
    background.composite(img2, 100, 150);
    return await background.getBuffer("image/png");
}
export default ImageConverter;