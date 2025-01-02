import {useEffect, useState} from 'react'
import './App.css'
import ImageConverter, {PDFtoIMG} from "./ImageConverter.tsx";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import {MantineProvider, DEFAULT_THEME, Text} from '@mantine/core';
import {Dropzone, FileWithPath, MIME_TYPES} from "@mantine/dropzone";

async function downloadImage() {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = URL.createObjectURL(new Blob([await ImageConverter()]));
    link.click();
    link.remove();
}

function App() {
    const [files, setFiles] = useState<File[]>([]);
    const [imageURL, setImageURL] = useState<string|undefined>(undefined);
    const imageVisualiser = async (receivedFiles: FileWithPath[]) => {
        //setImageURL(URL.createObjectURL(receivedFiles[0])??undefined)
        const fileObject = URL.createObjectURL(receivedFiles[0]);
        if (receivedFiles[0].type == MIME_TYPES.pdf) {
            const files = await PDFtoIMG(fileObject);
            setImageURL(files[0] ?? undefined);
        }
        else setImageURL(fileObject);
    }

    return (
        <MantineProvider theme={DEFAULT_THEME} defaultColorScheme={"dark"}>
            <Dropzone onDrop={(receivedFiles) => imageVisualiser(receivedFiles)}>
                <div>
                    <Text size={"xl"} inline>
                        Drag images here or click to select files
                    </Text>
                    <Text size={"sm"} c={"dimmed"} inline mt={8}>
                        Attach as many files as you like, each file should not exceed 5mb
                    </Text>
                </div>
            </Dropzone>
            <img src={imageURL} alt={"test"}/>
    </MantineProvider>
  )
}

export default App
