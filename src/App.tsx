import {useState} from 'react'
import './App.css'
import {CanvasLayout, PDFtoIMG} from "./ImageConverter.tsx";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import {MantineProvider, DEFAULT_THEME, Text, Button} from '@mantine/core';
import {Dropzone, FileWithPath, MIME_TYPES} from "@mantine/dropzone";
import FilePreview from "./FilePreview.tsx";

/*async function downloadImage() {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = URL.createObjectURL(new Blob([await ImageConverter()]));
    link.click();
    link.remove();
}*/

function App() {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [imageURL, setImageURL] = useState<string|undefined>(undefined);
    /*const imageVisualiser = async (receivedFiles: FileWithPath[]) => {
        //setImageURL(URL.createObjectURL(receivedFiles[0])??undefined)
        const fileObject = URL.createObjectURL(receivedFiles[0]);
        if (receivedFiles[0].type == MIME_TYPES.pdf) {
            const files = await PDFtoIMG(fileObject);
            setImageURL(files[0] ?? undefined);
        }
        else setImageURL(fileObject);
    }*/
    const createPocketfile = async () => {
        //TODO: Write check for whether they uploaded a PDF or image files
        const filesURL=[];
        for (const file of files){
            if (file.type == MIME_TYPES.pdf) {
                const convertedFiles = await PDFtoIMG(URL.createObjectURL(file));
                for (const convFile of convertedFiles){
                    filesURL.push(convFile);
                }
            }
            else filesURL.push(URL.createObjectURL(file))
        }
        const pocketfile = await CanvasLayout(filesURL);
        const pocketfileBlob = new Blob([pocketfile], { type: "image/png" });
        setImageURL(URL.createObjectURL(pocketfileBlob));
    }
    const fileChangeHandler = (setNewFiles: FileWithPath[]) => {
        setFiles(setNewFiles);
    }

    return (
        <MantineProvider theme={DEFAULT_THEME} defaultColorScheme={"dark"}>
            <Dropzone onDrop={setFiles} accept={[MIME_TYPES.png,MIME_TYPES.jpeg,MIME_TYPES.pdf]}>
                <div>
                    <Text size={"xl"} inline>
                        Drag images here or click to select files
                    </Text>
                    <Text size={"sm"} c={"dimmed"} inline mt={8}>
                        Attach as many files as you like, each file should not exceed 5mb
                    </Text>
                </div>
            </Dropzone>
            <FilePreview filesState={files} setFilesState={fileChangeHandler} />
            <Button onClick={createPocketfile}>Submit</Button>
            <img src={imageURL} alt={"test"} width={500}/>
    </MantineProvider>
  )
}

export default App
