import React, {ChangeEvent, useRef, useState} from 'react';
import './App.css';
import {Horizontal, Vertical} from "react-hook-components";
import invariant from "tiny-invariant";
import {v4} from "uuid";
import {MdInsertPhoto, MdOutlineCrop, MdOutlinePublish, MdOutlineUndo} from "react-icons/md";
import {TabBarButton} from "./TabBarButton";
import {Layer} from "./panel/Layer";
import {CropImagePanel} from "./panel/CropImagePanel";
import {AdjustImageTextPanel} from "./panel/AdjustImageTextPanel";

export enum ViewState {
    Initial,
    ImageSelected,
    ImageSaved
}


function App() {
    const [viewState, setViewState] = useState<ViewState>(ViewState.Initial);
    const [layers, setLayers] = useState<Layer[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const blockRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    function onCropImageAndContinue() {
        const newLayers = layers.map(layer => {
            const image = document.querySelector(`[data-id="${layer.id}"]`);
            invariant(image, 'image cannot be empty');
            invariant(blockRef.current, 'image cannot be empty');
            const {
                x: imageX,
                y: imageY,
                top: imageTop,
                left: imageLeft,
                width: imageWidth,
                height: imageHeight
            } = image.getBoundingClientRect();
            const {
                x: blockX,
                y: blockY,
                top: blockTop,
                left: blockLeft,
                width: blockWidth,
                height: blockHeight
            } = blockRef.current.getBoundingClientRect();
            debugger;
            const imageToActualRatio = imageHeight / layer.naturalHeight
            const imageToActualRatioTwo = imageWidth / layer.naturalWidth;
            if(imageToActualRatio !== imageToActualRatioTwo){
                debugger;
            }
            const startingXPos = (blockX - imageX) / imageToActualRatio;
            const startingYPos = (blockY - imageY) / imageToActualRatio;
            const dimensionWidth = blockWidth / imageToActualRatio;
            const dimensionHeight = blockHeight / imageToActualRatio;

            return {
                ...layer,
                viewPortX: startingXPos,
                viewPortY: startingYPos,
                viewPortHeight: dimensionHeight,
                viewPortWidth: dimensionWidth
            }

            // first we check the original size of the block using prefferedWidth and prefferedHeight
            // next we check the actual size of the current image object width and height
            //find the scale
            // calculate the current image block, x,y, width, height
            // scale the x and y against the preffered width and preffered height.
        });
        setLayers(newLayers);
        // we need to save image;
        setViewState(ViewState.ImageSaved);
    }

    function onPublish() {

    }

    async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
        invariant(event.target.files, 'Files is not available');
        const files = Array.from(event.target.files);
        const fileSources: Layer[] = await Promise.all(files.map(file => new Promise<Layer>(resolve => {
            const fileReader = new FileReader()

            function onReaderLoad() {
                const imageData = fileReader?.result?.toString() ?? '';
                const image = new Image();
                image.src = imageData;

                function onImageLoaded() {
                    const {naturalWidth, naturalHeight} = image;
                    const layer: Layer = {
                        id: v4(),
                        imageData: imageData,
                        naturalWidth,
                        naturalHeight,
                        viewPortHeight: 0,
                        viewPortWidth: 0,
                        viewPortX: 0,
                        viewPortY: 0
                    }
                    image.removeEventListener('load', onImageLoaded);
                    resolve(layer);
                }

                image.addEventListener('load', onImageLoaded);
                fileReader.removeEventListener('load', onReaderLoad);
            }

            fileReader.addEventListener('load', onReaderLoad);
            fileReader.readAsDataURL(file);
        })));
        setLayers(old => [...old, ...fileSources]);
        setViewState(ViewState.ImageSelected);
    }

    return (<Vertical h={'100%'} style={{position: 'relative'}}>
        <input type={"file"} onChange={onFileSelected}
               style={{display: 'none'}}
               ref={fileInputRef}
               accept=".jpg, .png, .jpeg, .gif"
        />
        <Vertical h={'100%'} position={'relative'}>
            {viewState === ViewState.ImageSelected &&
                <CropImagePanel layers={layers} blockRef={blockRef}/>}
            {viewState === ViewState.ImageSaved &&
                <AdjustImageTextPanel layers={layers} canvasRef={canvasRef}/>
            }
        </Vertical>
        <Horizontal hAlign={'center'}>
            {viewState === ViewState.Initial &&
                <TabBarButton onClick={() => fileInputRef?.current?.click()} title={'Select Image'}
                              icon={MdInsertPhoto}/>
            }
            {viewState === ViewState.ImageSelected &&
                <TabBarButton onClick={() => {
                    setLayers([]);
                    setViewState(ViewState.Initial);
                }} title={'Undo'} icon={MdOutlineUndo}/>
            }
            {viewState === ViewState.ImageSelected &&
                <TabBarButton onClick={onCropImageAndContinue} title={'Crop Image & Continue'} icon={MdOutlineCrop}/>
            }
            {viewState === ViewState.ImageSaved &&
                <TabBarButton onClick={() => {
                    setViewState(ViewState.ImageSelected);
                }} title={'Undo'} icon={MdOutlineUndo}/>
            }
            {viewState === ViewState.ImageSaved &&
                <TabBarButton onClick={onPublish} title={'Publish'} icon={MdOutlinePublish}/>
            }
        </Horizontal>
    </Vertical>);
}


export default App;
