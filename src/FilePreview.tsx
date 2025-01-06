import {ActionIcon, Box, CloseIcon, Group, Image} from "@mantine/core";
import {FileWithPath} from "@mantine/dropzone";
import {useEffect, useState} from "react";

function FilePreview({filesState, setFilesState}: {filesState: FileWithPath[], setFilesState: (setNewFiles: FileWithPath[]) => void}){
    const removeElement = (file:FileWithPath) => {
        const newFilesState = filesState.filter(e=>e!==file);
        setFilesState(newFilesState);
    }
    return (
        <Group>
            {filesState.map((file: FileWithPath) => (
                <FilePreviewElement image={file} removeElement={removeElement}/>
                ))}
        </Group>
    );
}

function FilePreviewElement({image, removeElement}:{image: FileWithPath, removeElement: (file: FileWithPath) => void}) {
    const [imageSrc, setImageSrc] = useState<string>("");
    const fetchImage = async (file: FileWithPath) => {
        const imgFetched = await fetch(URL.createObjectURL(file));
        const imgBlob = await imgFetched.blob();
        return URL.createObjectURL(imgBlob);
    }
    useEffect(() => {
        fetchImage(image).then(r => setImageSrc(r));
    }, [image]);
    return (
        <Box style={{display: "grid", grid:
                "15px 15px 85px / 85px 15px 15px",
        }} w={115} h={115}>
            <ActionIcon style={{gridArea:"1 / 2 / span 2 / span 2"}}
            onClick={()=> {
                removeElement(image);
            }}>
                <CloseIcon/>
            </ActionIcon>
            <Image radius={"md"} w={100} h={100} style={{gridArea:"2 / 1 / span 2 / span 2"}} src={imageSrc}/>
        </Box>
    );
}

export default FilePreview;