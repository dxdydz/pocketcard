import {ActionIcon, Box, CloseIcon, Group, Image, Paper, Text} from "@mantine/core";
import {FileWithPath, MIME_TYPES} from "@mantine/dropzone";
import {useEffect, useState} from "react";
import DocumentImg from "./assets/DocumentImg.png"

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
        if (file.type == MIME_TYPES.pdf) {
            const imgFetched = await fetch(DocumentImg);
            const imgBlob = await imgFetched.blob();
            return URL.createObjectURL(imgBlob);
        }
        return URL.createObjectURL(file);
    }
    useEffect(() => {
        fetchImage(image).then(r => setImageSrc(r));
    }, [image]);
    return (
        <Box style={{display: "grid", grid:
                "15px 15px auto auto 10px / 85px 15px 15px",
        }} w={115} h={115} mt={"md"}>
            <ActionIcon style={{gridArea:"1 / 2 / span 2 / span 2"}}
            onClick={()=> {
                removeElement(image);
            }}>
                <CloseIcon/>
            </ActionIcon>
            <Image radius={"md"} w={100} h={100} style={{gridArea:"2 / 1 / span 4 / span 2"}} src={imageSrc}/>
            <Paper style={{gridArea:"4 / 1 / span 2 / span 2"}}
                 radius={"md"}
                 bg={"linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))"}>
                <Text style={{paddingLeft:"5px", paddingRight:"5px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}
                      w={"100%"} size={"xs"} c={"white"}>{image.name}</Text>
            </Paper>
        </Box>
    );
}

export default FilePreview;