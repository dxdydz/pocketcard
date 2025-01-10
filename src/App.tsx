import {useState} from 'react'
import './App.css'
import {CanvasLayout, PDFtoIMG} from "./ImageConverter.tsx";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import {
    MantineProvider,
    DEFAULT_THEME,
    Text,
    Button,
    Divider,
    LoadingOverlay,
    Box,
    AppShell,
    AppShellHeader, AppShellMain, Group, Stack, Container, BackgroundImage, Title, Select, Image
} from '@mantine/core';
import {Dropzone, FileWithPath, MIME_TYPES} from "@mantine/dropzone";
import FilePreview from "./FilePreview.tsx";
import HeroBackground from "./assets/HeroBackground.jpg";
import PocketmodLayout from "./assets/PocketmodLayout.png"
import PocketfoldLayout from "./assets/PocketfoldLayout.png"

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
    const [layoutSubmission, setLayoutSubmission] = useState<string|null>(null);
    const addFiles = (newFiles: FileWithPath[])=>{
        setFiles(files.concat(newFiles));
    };
    const createPocketfile = async (layout: string|null) => {
        //TODO: Write check for whether they uploaded a PDF or image files
        if (layout==null) return;
        setImageIsLoading(true);
        const filesURL=[];
        for (const file of files) {
            if (file.type == MIME_TYPES.pdf) {
                const convertedFiles = await PDFtoIMG(URL.createObjectURL(file));
                for (const convFile of convertedFiles){
                    filesURL.push(convFile);
                }
            }
            else filesURL.push(URL.createObjectURL(file))
        }
        const pocketfile = await CanvasLayout(filesURL, layout);
        if (pocketfile==undefined) return;
        const pocketfileBlob = new Blob([pocketfile], { type: "image/png" });
        setImageURL(URL.createObjectURL(pocketfileBlob));
        setImageIsLoading(false);
    };
    const fileChangeHandler = (setNewFiles: FileWithPath[]) => {
        setFiles(setNewFiles);
    };
    return (
        <MantineProvider theme={DEFAULT_THEME} defaultColorScheme={"dark"}>
            <AppShell header={{height: 60}}>
                <AppShellHeader pl={32} pr={32}>
                    <Group align={"center"} h={"100%"}>
                        <Title>Pocketverter</Title>
                    </Group>
                </AppShellHeader>

                <AppShellMain>
                    <Container fluid p={0} mb={10}>
                        <BackgroundImage src={HeroBackground} py={32} px={80}>
                                <Stack align={"flex-start"} gap={4}>
                                    <Title c={"white"}>Pocketverter</Title>
                                    <Text c={"white"}>Convert your printables to a portable format!</Text>
                                </Stack>
                        </BackgroundImage>
                    </Container>
                    <Group grow align={"flex-start"} gap={32}>
                        <Stack px={"5%"}>
                            <div>
                                <Dropzone onDrop={addFiles} accept={[MIME_TYPES.png,MIME_TYPES.jpeg,MIME_TYPES.pdf]}>
                                    <div>
                                        <Text size={"xl"} inline>
                                            Drag images here or click to select files
                                        </Text>
                                        <Text size={"sm"} c={"dimmed"} inline mt={8}>
                                            Attach as many files as you like, any files beyond 8 pages will be ignored
                                        </Text>
                                    </div>
                                </Dropzone>
                                <FilePreview filesState={files} setFilesState={fileChangeHandler} />
                                <Button onClick={()=>{createPocketfile(layoutSubmission); setFileSubmitted(true)}} mt={"md"}>Submit</Button>
                            </div>
                            {fileSubmitted &&
                                <>
                                    <Divider my={"md"}/>
                                    <Box pos={"relative"}>
                                        <LoadingOverlay visible={imageIsLoading}/> {/*TODO: Figure out how to make this take space when img is off*/}
                                        {imageURL ? <img src={imageURL} alt={"Exported Image"} width={500} /> : <Box c={"gray"} w={500} h={500}></Box>}
                                    </Box>
                                    {imageURL && <Button onClick={()=>downloadImage(imageURL)} mt={"md"}>Download</Button>}
                                </>}
                        </Stack>
                        <Stack>
                            <Select
                                label={"Layout"}
                                description={"Select layout of the output file. The preview of the layout will be visible below."}
                                data={["Pocketmod","Pocketfold"]}
                                onChange={setLayoutSubmission}
                                style={{textAlign: "left"}}
                            />
                            {layoutSubmission && <Image w={"50%"} src={LayoutPreview(layoutSubmission)} mx={"auto"} />}
                        </Stack>
                    </Group>
                </AppShellMain>

            </AppShell>
        </MantineProvider>
    );
}

function LayoutPreview(layout: string){
    if (layout==="Pocketmod")
        return PocketmodLayout;
    else if (layout==="Pocketfold")
        return PocketfoldLayout;
    else return undefined;
}

export default App
