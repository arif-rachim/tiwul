import React, {
    DragEvent,
    MutableRefObject,
    TouchEvent,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import invariant from "tiny-invariant";
import {Vertical} from "react-hook-components";
import {Layer} from "./Layer";
import {MdOutlineCrop, MdOutlineUndo} from "react-icons/md";
import {AppContext, ViewState} from "../App";
import {numToPx} from "./utility";


export function validateBlockMovement(newBlock: { left: number; top: number; right: number; bottom: number }, originalBlock: { left: number; top: number; right: number; bottom: number }) {
    const xMovementNotValid = false;
    const YMovementNotValid = false;

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

export function CropImagePanel(props: { layers: Layer[], blockRef: MutableRefObject<HTMLDivElement | null> }) {
    const {layers} = props;
    const layerContainerRef = useRef<HTMLDivElement>(null);
    const context = useContext(AppContext);
    invariant(context, 'AppContext cannot be null');
    const localBlockRef = useRef<HTMLDivElement>(null);
    const blockRef = props.blockRef ?? localBlockRef;
    const onCropImageAndContinue = useCallback(function onCropImageAndContinue() {
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
            const imageToActualRatio = imageHeight / layer.naturalHeight
            const imageToActualRatioTwo = imageWidth / layer.naturalWidth;
            // if (imageToActualRatio !== imageToActualRatioTwo) {
            //     debugger;
            // }
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
        invariant(context, 'Context cannot be empty');
        context.setLayers(newLayers);
        context.setViewState(ViewState.ImageSaved);
    },[blockRef, context, layers]);

    useEffect(() => {
        context.setTabMenu([
            {
                icon: MdOutlineUndo, title: 'Undo', onClick: () => {
                    context.setLayers([]);
                    context.setViewState(ViewState.Initial);
                }
            },
            {icon: MdOutlineCrop, title: 'Crop Image & Continue', onClick: () => onCropImageAndContinue()},
        ])
    }, [context, onCropImageAndContinue])

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

    const leftHandlerRef = useRef<HTMLDivElement>(null);
    const leftOverlayRef = useRef<HTMLDivElement>(null);
    const rightHandlerRef = useRef<HTMLDivElement>(null);
    const rightOverlayRef = useRef<HTMLDivElement>(null);
    const topHandlerRef = useRef<HTMLDivElement>(null);
    const topOverlayRef = useRef<HTMLDivElement>(null);
    const bottomHandlerRef = useRef<HTMLDivElement>(null);
    const bottomOverlayRef = useRef<HTMLDivElement>(null);

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
        const newBlock = {left: marginX, right: marginX, top: marginY, bottom: marginY}
        setBlockDimension((originalBlock) => validateBlockMovement(newBlock, originalBlock));
    }, []);

    function onDragEnd(event: DragEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) {

        invariant(blockRef.current, "missing blockRef");
        const {left, right, top, bottom} = blockRef.current.style;
        console.log('Setting bottom', bottom);

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

    function onDragStart(event: DragEvent | TouchEvent) {
        if ('touches' in event) {

        } else {
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            event.dataTransfer.setDragImage(img, 0, 0);
        }
    }

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
        const validX = blockDimension.left >= 0 && blockDimension.right >= 0;
        const validY = blockDimension.top >= 0 && blockDimension.bottom >= 0;
        if (validX) {
            leftOverlayRef.current.style.width = numToPx(blockDimension.left);
            rightOverlayRef.current.style.width = numToPx(blockDimension.right);
            topOverlayRef.current.style.left = numToPx(blockDimension.left);
            topOverlayRef.current.style.right = numToPx(blockDimension.right);
            bottomOverlayRef.current.style.left = numToPx(blockDimension.left);
            bottomOverlayRef.current.style.right = numToPx(blockDimension.right);
            blockRef.current.style.left = numToPx(blockDimension.left);
            blockRef.current.style.right = numToPx(blockDimension.right);
            leftHandlerRef.current.style.left = numToPx(blockDimension.left - 20);
            rightHandlerRef.current.style.right = numToPx(blockDimension.right - 20);
            topHandlerRef.current.style.right = numToPx(blockDimension.right);
            topHandlerRef.current.style.left = numToPx(blockDimension.left);
            bottomHandlerRef.current.style.right = numToPx(blockDimension.right);
            bottomHandlerRef.current.style.left = numToPx(blockDimension.left);
        }
        if (validY) {
            topOverlayRef.current.style.height = numToPx(blockDimension.top);
            bottomOverlayRef.current.style.height = numToPx(blockDimension.bottom);
            blockRef.current.style.top = numToPx(blockDimension.top);
            blockRef.current.style.bottom = numToPx(blockDimension.bottom);
            leftHandlerRef.current.style.top = numToPx(blockDimension.top);
            leftHandlerRef.current.style.bottom = numToPx(blockDimension.bottom);
            rightHandlerRef.current.style.top = numToPx(blockDimension.top);
            rightHandlerRef.current.style.bottom = numToPx(blockDimension.bottom);
            topHandlerRef.current.style.top = numToPx(blockDimension.top - 20);
            bottomHandlerRef.current.style.bottom = numToPx(blockDimension.bottom - 20);
        }

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

        if (isBottomHandler && distance.y > 0) {

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

        if (isRightHandler && distance.x > 0) {
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

    return <Vertical h={'100%'} w={'100%'} ref={layerContainerRef} style={{position: 'relative'}}
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
            return <img alt={'Uploaded layer'} src={file.imageData} key={file.id} data-id={file.id} style={{
                position: 'absolute',
                top: marginY,
                left: marginX,
                height: imageHeight,
                width: imageWidth,
            }}/>
        })}
        <Vertical ref={leftOverlayRef} className={'overlay'} style={{left: 0, height: '100%'}}/>
        <Vertical ref={rightOverlayRef} className={'overlay'} style={{right: 0, height: '100%',}}/>
        <Vertical ref={topOverlayRef} className={'overlay'} style={{top: 0}}/>
        <Vertical ref={bottomOverlayRef} className={'overlay'} style={{bottom: 0}}/>
        <Vertical ref={blockRef} draggable={true}
                  className={'block'} onDrag={onDragBlockRef}
                  onDragStart={onDragStartBlockRef} onDragEnd={onDragEndBlockRef} onTouchMove={onDragBlockRef}
                  onTouchStart={onDragStartBlockRef} onTouchEnd={onDragEndBlockRef}/>
        <Vertical draggable={true} ref={leftHandlerRef} className={'handler x'} onDragStart={onDragStart}
                  onDrag={onDrag} onDragEnd={onDragEnd} onTouchMove={onDrag}
                  onTouchEnd={onDragEnd}/>
        <Vertical draggable={true} ref={rightHandlerRef} className={'handler x'} onDragStart={onDragStart}
                  onDrag={onDrag} onDragEnd={onDragEnd} onTouchMove={onDrag}
                  onTouchEnd={onDragEnd}/>
        <Vertical draggable={true} ref={topHandlerRef} className={'handler y'} onDragStart={onDragStart} onDrag={onDrag}
                  onDragEnd={onDragEnd} onTouchMove={onDrag}
                  onTouchEnd={onDragEnd}/>
        <Vertical draggable={true} ref={bottomHandlerRef} className={'handler y'} onDragStart={onDragStart}
                  onDrag={onDrag} onDragEnd={onDragEnd} onTouchMove={onDrag}
                  onTouchEnd={onDragEnd}/>
    </Vertical>;
}