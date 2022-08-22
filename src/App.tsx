import React, {ChangeEvent, DragEvent, TouchEvent, useEffect, useRef, useState} from 'react';
import './App.css';
import {Vertical} from "react-hook-components";
import invariant from "tiny-invariant";
import {v4} from "uuid";
import {BiLayerPlus} from "react-icons/bi";

interface Layer {
    id: string;
    imageData: string;
    naturalWidth: number;
    naturalHeight: number;
}

function toPx(value: number) {
    return `${value}px`;
}

const borderWidth = '3rem';

function validateBlockMovement(newBlock: { left: number; top: number; right: number; bottom: number }, originalBlock: { left: number; top: number; right: number; bottom: number }) {

    const xMovementNotValid = newBlock.left < 0 || newBlock.right < 0;
    const YMovementNotValid = newBlock.top < 0 || newBlock.bottom < 0;
    if (xMovementNotValid) {
        newBlock.left = originalBlock.left;
        newBlock.right = originalBlock.right;
    }
    if (YMovementNotValid) {
        newBlock.top = originalBlock.top;
        newBlock.bottom = originalBlock.bottom;
    }
    return {...newBlock};
}

function App() {
    const [layers, setLayers] = useState<Layer[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const layerContainerRef = useRef<HTMLDivElement>(null);
    const [layerContainerDimension, setLayerContainerDimension] = useState<{ width: number, height: number, left: number, top: number }>({
        width: 0,
        height: 0,
        left: 0,
        top: 0
    });
    const [blockDimension, setBlockDimension] = useState<{ left: number, top: number, right: number, bottom: number }>({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    });
    const blockRef = useRef<HTMLDivElement>(null);
    const leftHandlerRef = useRef<HTMLDivElement>(null);
    const leftOverlayRef = useRef<HTMLDivElement>(null);
    const rightHandlerRef = useRef<HTMLDivElement>(null);
    const rightOverlayRef = useRef<HTMLDivElement>(null);
    const topHandlerRef = useRef<HTMLDivElement>(null);
    const topOverlayRef = useRef<HTMLDivElement>(null);
    const bottomHandlerRef = useRef<HTMLDivElement>(null);
    const bottomOverlayRef = useRef<HTMLDivElement>(null);


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
                        naturalHeight
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
    }

    useEffect(() => {
        const {width, height, left, top} = layerContainerRef.current?.getBoundingClientRect() ?? {
            width: 0,
            height: 0,
            left: 0,
            top: 0
        };
        const squareSize = Math.min(width, height);
        const marginX = (width - squareSize) / 2;
        const marginY = (height - squareSize) / 2;

        setLayerContainerDimension({width, height, left, top});
        const newBlock = {left:marginX,right:marginX,top:marginY,bottom:marginY}
        setBlockDimension((originalBlock) => validateBlockMovement(newBlock, originalBlock));
    }, []);

    function onDragEnd(event: DragEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) {

        invariant(blockRef.current, "missing blockRef");
        const {left, right, top, bottom} = blockRef.current.style;

        function toNumber(text: string) {
            return parseInt(text.replace('px', ''))
        }
        setBlockDimension(originalBlock => validateBlockMovement({
            left: toNumber(left),
            right: toNumber(right),
            top: toNumber(top),
            bottom: toNumber(bottom)
        }, originalBlock));

    }

    const blockRefInitialDrag = useRef<{ x: number, y: number }>({x: 0, y: 0});

    function onDragStartBlockRef(event: DragEvent | TouchEvent) {

        let clientX = 0;
        let clientY = 0;
        if ('touches' in event) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        const distance = {x: clientX - layerContainerDimension.left, y: clientY - layerContainerDimension.top};
        blockRefInitialDrag.current = distance;

        if ('touches' in event) {

        } else {
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            event.dataTransfer.setDragImage(img, 0, 0);
        }

    }

    function renderPosition(blockDimension: { top: number, left: number, right: number, bottom: number }) {

        invariant(topHandlerRef.current, 'missing topHandlerRef');
        invariant(bottomHandlerRef.current, 'missing bottomHandlerRef');
        invariant(leftHandlerRef.current, 'missing leftHandlerRef');
        invariant(rightHandlerRef.current, 'missing rightHandlerRef');
        invariant(topOverlayRef.current, 'missing topOverlayRef');
        invariant(bottomOverlayRef.current, 'missing bottomOverlayRef');
        invariant(leftOverlayRef.current, 'missing leftOverlayRef');
        invariant(rightOverlayRef.current, 'missing rightOverlayRef');
        invariant(blockRef.current, 'missing blockRef');

        leftOverlayRef.current.style.width = toPx(blockDimension.left);
        rightOverlayRef.current.style.width = toPx(blockDimension.right);

        topOverlayRef.current.style.height = toPx(blockDimension.top);
        topOverlayRef.current.style.left = toPx(blockDimension.left);
        topOverlayRef.current.style.right = toPx(blockDimension.right);

        bottomOverlayRef.current.style.height = toPx(blockDimension.bottom);
        bottomOverlayRef.current.style.left = toPx(blockDimension.left);
        bottomOverlayRef.current.style.right = toPx(blockDimension.right);

        blockRef.current.style.top = toPx(blockDimension.top);
        blockRef.current.style.left = toPx(blockDimension.left);
        blockRef.current.style.right = toPx(blockDimension.right);
        blockRef.current.style.bottom = toPx(blockDimension.bottom);

        leftHandlerRef.current.style.left = toPx(blockDimension.left);
        leftHandlerRef.current.style.top = toPx(blockDimension.top);
        leftHandlerRef.current.style.bottom = toPx(blockDimension.bottom);

        rightHandlerRef.current.style.right = toPx(blockDimension.right);
        rightHandlerRef.current.style.top = toPx(blockDimension.top);
        rightHandlerRef.current.style.bottom = toPx(blockDimension.bottom);

        topHandlerRef.current.style.right = toPx(blockDimension.right);
        topHandlerRef.current.style.left = toPx(blockDimension.left);
        topHandlerRef.current.style.top = toPx(blockDimension.top);

        bottomHandlerRef.current.style.right = toPx(blockDimension.right);
        bottomHandlerRef.current.style.left = toPx(blockDimension.left);
        bottomHandlerRef.current.style.bottom = toPx(blockDimension.bottom);
    }

    useEffect(() => renderPosition(blockDimension), [blockDimension])

    function onDragBlockRef(event: DragEvent | TouchEvent) {

        let clientX = 0;
        let clientY = 0;
        if ('touches' in event) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        const distance = {x: clientX - layerContainerDimension.left, y: clientY - layerContainerDimension.top};
        const movementX = blockRefInitialDrag.current.x - distance.x;
        const movementY = blockRefInitialDrag.current.y - distance.y;
        renderPosition({
            left: blockDimension.left - movementX,
            right: blockDimension.right + movementX,
            top: blockDimension.top - movementY,
            bottom: blockDimension.bottom + movementY
        })
    }

    function onDragEndBlockRef(event: DragEvent | TouchEvent) {


        let clientX = -1;
        let clientY = -1;
        if ('changedTouches' in event) {
            if (event.changedTouches.length > 0) {
                clientX = event.changedTouches[0].clientX;
                clientY = event.changedTouches[0].clientY;
            } else {
                console.log('Could not get touch shit', event.touches);
            }
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        if (clientX < 0 || clientY < 0) {
            console.log('could not find end of touch event')
            return;
        }
        const distance = {x: clientX - layerContainerDimension.left, y: clientY - layerContainerDimension.top};
        const movementX = blockRefInitialDrag.current.x - distance.x;
        const movementY = blockRefInitialDrag.current.y - distance.y;

        setBlockDimension(originalBlock => validateBlockMovement({
            left: blockDimension.left - movementX,
            right: blockDimension.right + movementX,
            top: blockDimension.top - movementY,
            bottom: blockDimension.bottom + movementY
        }, originalBlock));
    }

    function onDrag(event: DragEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) {
        const target: HTMLDivElement = event.target as HTMLDivElement;
        invariant(topHandlerRef.current, 'missing topHandlerRef');
        invariant(bottomHandlerRef.current, 'missing bottomHandlerRef');
        invariant(leftHandlerRef.current, 'missing leftHandlerRef');
        invariant(rightHandlerRef.current, 'missing rightHandlerRef');
        invariant(topOverlayRef.current, 'missing topOverlayRef');
        invariant(bottomOverlayRef.current, 'missing bottomOverlayRef');
        invariant(leftOverlayRef.current, 'missing leftOverlayRef');
        invariant(rightOverlayRef.current, 'missing rightOverlayRef');
        invariant(blockRef.current, 'missing blockRef');
        let clientY = 0;
        let clientX = 0;
        if ('touches' in event) {
            clientY = event.touches[0].clientY;
            clientX = event.touches[0].clientX;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }


        const distance = {x: clientX - layerContainerDimension.left, y: clientY - layerContainerDimension.top};
        const isTopHandler = event.target === topHandlerRef.current;
        const isLeftHandler = event.target === leftHandlerRef.current;
        const isRightHandler = event.target === rightHandlerRef.current;
        const isBottomHandler = event.target === bottomHandlerRef.current;
        const positionInsideContainer = distance.y >= 0 && distance.y <= layerContainerDimension.height && distance.x >= 0 && distance.x <= layerContainerDimension.width;
        if (!positionInsideContainer) {
            return;
        }
        if (isTopHandler) {
            target.style.top = `${distance.y}px`;
            topOverlayRef.current.style.height = `${distance.y}px`;
            blockRef.current.style.top = `${distance.y}px`;
            leftHandlerRef.current.style.top = `${distance.y}px`;
            rightHandlerRef.current.style.top = `${distance.y}px`;
        }

        if (isBottomHandler) {
            const distanceYBottom = layerContainerDimension.height - distance.y;
            target.style.bottom = `${distanceYBottom}px`;
            bottomOverlayRef.current.style.height = `${distanceYBottom}px`;
            blockRef.current.style.bottom = `${distanceYBottom}px`;
            leftHandlerRef.current.style.bottom = `${distanceYBottom}px`;
            rightHandlerRef.current.style.bottom = `${distanceYBottom}px`;
        }

        if (isLeftHandler) {
            target.style.left = `${distance.x}px`;
            leftOverlayRef.current.style.width = `${distance.x}px`;
            blockRef.current.style.left = `${distance.x}px`;
            topHandlerRef.current.style.left = `${distance.x}px`;
            bottomHandlerRef.current.style.left = `${distance.x}px`;
            topOverlayRef.current.style.left = `${distance.x}px`;
            bottomOverlayRef.current.style.left = `${distance.x}px`;
        }

        if (isRightHandler) {
            const distanceXRight = layerContainerDimension.width - distance.x;
            target.style.right = `${distanceXRight}px`;
            rightOverlayRef.current.style.width = `${distanceXRight}px`;

            blockRef.current.style.right = `${distanceXRight}px`;
            topHandlerRef.current.style.right = `${distanceXRight}px`;
            bottomHandlerRef.current.style.right = `${distanceXRight}px`;
            topOverlayRef.current.style.right = `${distanceXRight}px`;
            bottomOverlayRef.current.style.right = `${distanceXRight}px`;
        }
    }

    return (<Vertical h={'100%'} style={{position: 'relative'}}>
        <input type={"file"} onChange={onFileSelected} style={{display: 'none'}} ref={fileInputRef}/>

        <Vertical h={'100%'} style={{margin: '1rem'}} position={'relative'}>
            <Vertical h={'100%'} w={'100%'} ref={layerContainerRef} style={{position: 'relative'}}
                      onDragOver={e => e.preventDefault()}>
                {layers.map(file => {
                    const {width: cWidth, height: cHeight} = layerContainerDimension;
                    const isPortrait = cWidth < cHeight;
                    const ratio = file.naturalWidth / file.naturalHeight;
                    let imageWidth = isPortrait ? cWidth : cHeight * ratio;
                    let imageHeight = isPortrait ? cWidth / ratio : cHeight;
                    if (imageHeight > cHeight) {
                        const scale = cHeight / imageHeight;
                        imageHeight = cHeight;
                        imageWidth = imageWidth * scale;
                    }
                    let marginX = ((cWidth - imageWidth) / 2);
                    let marginY = ((cHeight - imageHeight) / 2);
                    return <img src={file.imageData} key={file.id} style={{
                        position: 'absolute',
                        top: marginY,
                        left: marginX,
                        height: imageHeight,
                        width: imageWidth,
                    }}/>
                })}
                <Vertical ref={leftOverlayRef} style={{
                    position: 'absolute',
                    left: 0,
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)'
                }}/>
                <Vertical ref={rightOverlayRef} style={{
                    position: 'absolute',
                    right: 0,
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)'
                }}/>
                <Vertical ref={topOverlayRef} style={{
                    position: 'absolute',
                    top: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)'
                }}/>
                <Vertical ref={bottomOverlayRef} style={{
                    position: 'absolute',
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)'
                }}/>
                <Vertical draggable={true} ref={blockRef}
                          style={{position: 'absolute', border: '5px dashed rgba(0,0,0,0.5)'}} onDrag={onDragBlockRef}
                          onDragStart={onDragStartBlockRef} onDragEnd={onDragEndBlockRef} onTouchMove={onDragBlockRef}
                          onTouchStart={onDragStartBlockRef} onTouchEnd={onDragEndBlockRef}/>
                <Vertical draggable={true} ref={leftHandlerRef} style={{
                    position: 'absolute',
                    width: borderWidth,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    cursor: "move"
                }} onDrag={onDrag} onDragEnd={onDragEnd} onTouchMove={onDrag} onTouchEnd={onDragEnd}/>
                <Vertical draggable={true} ref={rightHandlerRef} style={{
                    position: 'absolute',
                    width: borderWidth,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    cursor: "move"
                }} onDrag={onDrag} onDragEnd={onDragEnd} onTouchMove={onDrag} onTouchEnd={onDragEnd}/>
                <Vertical draggable={true} ref={topHandlerRef} style={{
                    position: 'absolute',
                    height: borderWidth,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    cursor: "move"
                }} onDrag={onDrag} onDragEnd={onDragEnd} onTouchMove={onDrag} onTouchEnd={onDragEnd}/>
                <Vertical draggable={true} ref={bottomHandlerRef} style={{
                    position: 'absolute',
                    height: borderWidth,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    cursor: "move"
                }} onDrag={onDrag} onDragEnd={onDragEnd} onTouchMove={onDrag} onTouchEnd={onDragEnd}/>
            </Vertical>
        </Vertical>
        <Vertical style={{
            bottom: '1rem',
            right: '1rem',
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 5px 3px -2px rgba(0,0,0,0.05)'
        }} onClick={() => fileInputRef?.current?.click()}>
            <BiLayerPlus style={{fontSize: '3rem'}}/>
        </Vertical>
    </Vertical>);
}

export default App;
