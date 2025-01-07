import {useState} from 'react'
import './App.css'
import {CanvasLayout, PDFtoIMG} from "./ImageConverter.tsx";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import {MantineProvider, DEFAULT_THEME, Text, Button, Divider, LoadingOverlay, Box} from '@mantine/core';
import {Dropzone, FileWithPath, MIME_TYPES} from "@mantine/dropzone";
import FilePreview from "./FilePreview.tsx";

async function downloadImage(imageURL: string) {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = imageURL;
    link.click();
    link.remove();
}

function App() {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [imageURL, setImageURL] = useState<string|undefined>(undefined);
    const [imageIsLoading, setImageIsLoading] = useState<boolean>(false);
    const [fileSubmitted, setFileSubmitted] = useState<boolean>(false);
    const addFiles = (newFiles: FileWithPath[])=>{
        setFiles(files.concat(newFiles));
    };
    const createPocketfile = async () => {
        //TODO: Write check for whether they uploaded a PDF or image files
        setImageIsLoading(true);
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
        setImageIsLoading(false);
    };
    const fileChangeHandler = (setNewFiles: FileWithPath[]) => {
        setFiles(setNewFiles);
    };
    return (
        <MantineProvider theme={DEFAULT_THEME} defaultColorScheme={"dark"}>
            <div>
                <Dropzone onDrop={addFiles} accept={[MIME_TYPES.png,MIME_TYPES.jpeg,MIME_TYPES.pdf]}>
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
                <Button onClick={()=>{createPocketfile(); setFileSubmitted(true)}} mt={"md"}>Submit</Button>
            </div>
            {fileSubmitted &&
                <>
                    <Divider my={"md"}/>
                    <Box pos={"relative"}>
                        <LoadingOverlay visible={imageIsLoading}/> {/*TODO: Figure out how to make this take space when img is off*/}
                        {imageURL && <img src={imageURL} alt={"Exported Image"} width={500} />}
                    </Box>
                    {imageURL && <Button onClick={()=>downloadImage(imageURL)} mt={"md"}>Download</Button>}
                </>}
        </MantineProvider>
    );
}

export default App
