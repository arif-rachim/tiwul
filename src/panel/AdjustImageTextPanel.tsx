import {Vertical} from "react-hook-components";
import {Layer} from "./Layer";
import React, {MutableRefObject, useCallback, useContext, useEffect, useRef, useState} from "react";
import invariant from "tiny-invariant";
import {MdOutlinePublish, MdOutlineUndo, MdTextFields} from "react-icons/md";
import {
    AppContext,
    IMAGE_PATH_URI_SEPARATOR, IMAGE_SERVER_UPLOAD,
    IMAGE_SERVER_VIEWER,
    ImageData, MOCK_IMAGE,
    TextLayer,
    ViewState
} from "../App";
import {waitForEvent} from "./utility";
import ResizeMoveAndRotate from "./ResizeMoveAndRotate";
import {v4} from "uuid";
import produce from "immer";

const MOCK_IMAGE_DATA:ImageData = {
    image : {
        url:'',
        extension:'',
        filename:'',
        mime:'',
        name:''
    },
    height : '',
    delete_url : '',
    display_url:'http://localhost:3000/image/sample.png',
    url:'',
    id:'',
    width:'',
    title:'',
    expiration:'',
    thumb:{
        url:'',
        extension:'',
        filename:'',
        mime:'',
        name:''
    },
    time:'',
    url_viewer:'',
    size:0
};

export function AdjustImageTextPanel(props: { layers: Layer[], canvasRef: MutableRefObject<HTMLCanvasElement | null>, textLayers: TextLayer[] }) {
    const {layers, textLayers} = props;
    const _canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = props.canvasRef ?? _canvasRef;
    const context = useContext(AppContext);
    const textLayerRef = useRef<HTMLDivElement|null>(null);
    const canvasContainer = useRef<HTMLDivElement|null>(null);
    invariant(context, 'AppContext cannot be null');
    const [focusedText,setFocusedText] = useState<TextLayer>();
    const onPublish = useCallback(async function onPublish() {
        const data = canvasRef?.current?.toDataURL() ?? '';
        const base64 = 'base64,'
        const startIndex = data.indexOf(base64);
        const formData = new FormData();
        formData.append('image', data.substring(startIndex + base64.length, data.length));
        formData.append('key', decodeURIComponent(escape(window.atob('ZTAxNTViNjQzMzExZTUyNTY4YjdjZWQxMGQ5ZGU3NGE='))));
        formData.append('expiration', '600');
        let imageData: ImageData|undefined = undefined;
        if(MOCK_IMAGE){
            imageData = MOCK_IMAGE_DATA
        }else{
            const response = await fetch(IMAGE_SERVER_UPLOAD, {
                method: 'POST',
                body: formData
            });
            const json: any = await response.json();
            imageData = json.data;
        }
        invariant(imageData,'Image data cannot be empty');
        // lets create redirect url,
        const params = textLayers.map(textLayer => {
            const {top,left,width,height,rotation} = textLayer;
            return `${top}/${left}/${height}/${width}/${rotation}`
        }).join('/');

        const domainName = IMAGE_SERVER_VIEWER;
        const url = imageData.display_url.substring(domainName.length,imageData.display_url.length);
        const newUrl = `/${params}${IMAGE_PATH_URI_SEPARATOR}${url}`;
        window.location.assign(newUrl);
    }, [canvasRef,textLayers]);

    useEffect(() => {
        context.setTabMenu([
            {icon: MdOutlineUndo, title: 'Undo', onClick: () => context.setViewState(ViewState.ImageSelected)},
            {
                icon: MdTextFields,
                title: 'Add Label',
                onClick: () => context.setTextLayers(old => [...old, {
                    width: 120,
                    height: 25,
                    top: 20,
                    left: 20,
                    fontFamily: '',
                    fontSize: 16,
                    id: v4(),
                    rotation: 0
                }])
            },
            {icon: MdOutlinePublish, title: 'Publish', onClick: () => onPublish()}
        ])
    }, [context, onPublish])

    useEffect(() => {
        // lets check canvas width
        invariant(canvasRef.current, 'Canvas cannot be empty');
        let {width: canvasWidth} = canvasRef.current.getBoundingClientRect();
        (async () => {
            const canvas = canvasRef.current;
            invariant(canvas, 'Canvas information');
            const ctx = canvas.getContext("2d");
            invariant(ctx, 'Context inline');
            const {width:containerWidth,height:containerHeight} = canvasContainer.current?.getBoundingClientRect() ?? {width:0,height:0};
            for (const layer of layers) {
                const canvasScale = canvasWidth / layer.viewPortWidth
                //const viewportScale = canvasWidth / layer.naturalWidth;
                let canvasHeight = layer.viewPortHeight * canvasScale;

                if(canvasHeight > containerHeight){
                    canvasWidth = canvasWidth * (containerHeight / canvasHeight );
                    canvasHeight = containerHeight;
                }

                const marginLeft = Math.round((containerWidth - canvasWidth) / 2)+'px';

                canvas.height = canvasHeight;
                canvas.width = canvasWidth;

                canvas.style.width = canvasWidth+'px';
                canvas.style.height = canvasHeight+'px';
                canvas.style.marginLeft = marginLeft;
                const textLayer = textLayerRef.current;
                invariant(textLayer);
                textLayer.style.width = canvasWidth+'px';
                textLayer.style.height = canvasHeight+'px';
                textLayer.style.marginLeft = marginLeft;


                const image = new Image();
                image.src = layer.imageData;
                await waitForEvent('load', image);
                const sx = layer.viewPortX;
                const sy = layer.viewPortY;
                const sw = layer.viewPortWidth;
                const sh = layer.viewPortHeight;
                ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);
            }

        })();
    }, [canvasRef, layers]);
    return <Vertical h={'100%'} style={{position: "relative"}}>
        <Vertical ref={canvasContainer} h={'100%'} overflow={'hidden'} style={{position: "relative"}}>
            <canvas ref={canvasRef} />
        </Vertical>
        <Vertical ref={textLayerRef} style={{position: 'absolute'}} onMouseDown={() => setFocusedText(undefined)} onTouchStart={() => setFocusedText(undefined)}>
            {textLayers.map((textLayer:TextLayer) => {

                function onResizeChange(event:{width: number, height: number, top: number, left: number, rotation: number}){
                    invariant(context,'Context cannot be empty');
                    context.setTextLayers(produce(textLayers => {
                        const index = textLayers.findIndex(t => t.id===textLayer.id);
                        const tl:TextLayer = textLayers[index];
                        tl.top = event.top;
                        tl.left = event.left;
                        tl.width = event.width;
                        tl.height = event.height;
                        tl.rotation = event.rotation;
                    }))
                }
                return <ResizeMoveAndRotate key={textLayer.id} style={{
                    width:textLayer.width,
                    height:textLayer.height,
                    transform:`rotate(${textLayer.rotation}deg)`,
                    top:textLayer.top,
                    left:textLayer.left,
                    fontFamily:textLayer.fontFamily,
                    fontSize:textLayer.fontSize,
                }} onChange={onResizeChange} isEditMode={focusedText?.id === textLayer.id} onFocus={(event) => {
                    event.stopPropagation();
                    setFocusedText(textLayer);
                }}>
                    <Vertical style={{
                               backgroundColor:'rgba(0,0,0,0.3)',
                                border : '1px solid rgba(255,255,255,0.5)',
                               width: '100%',
                               height: '100%',
                           }}/>
                </ResizeMoveAndRotate >
            })}
        </Vertical>
    </Vertical>
}