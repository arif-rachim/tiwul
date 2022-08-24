import {Vertical} from "react-hook-components";
import {Layer} from "./Layer";
import React, {MutableRefObject, useCallback, useContext, useEffect, useRef} from "react";
import invariant from "tiny-invariant";
import {waitForEvent} from "./waitForEvent";
import {MdOutlinePublish, MdOutlineUndo, MdTextFields} from "react-icons/md";
import {AppContext, ViewState} from "../App";

export function AdjustImageTextPanel(props: { layers: Layer[], canvasRef: MutableRefObject<HTMLCanvasElement | null> }) {
    const {layers} = props;
    const _canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = props.canvasRef ?? _canvasRef;
    const context = useContext(AppContext);
    invariant(context, 'AppContext cannot be null');

    const onPublish = useCallback(async function onPublish() {
        const data = canvasRef?.current?.toDataURL() ?? '';
        const base64 = 'base64,'
        const startIndex = data.indexOf(base64);
        const formData = new FormData();
        formData.append('image', data.substring(startIndex + base64.length, data.length));
        formData.append('key', decodeURIComponent(escape(window.atob('ZTAxNTViNjQzMzExZTUyNTY4YjdjZWQxMGQ5ZGU3NGE='))));
        formData.append('expiration', '600');
        const response = await fetch(`https://api.imgbb.com/1/upload`, {
            method: 'POST',
            body: formData
        });
        const json: any = await response.json();
        const imageData: ImageData = json;
    },[canvasRef]);

    useEffect(() => {
        context.setTabMenu([
            {icon: MdOutlineUndo, title: 'Undo', onClick: () => context.setViewState(ViewState.ImageSelected)},
            {
                icon: MdTextFields, title: 'Add Label', onClick: () => {
                }
            },
            {icon: MdOutlinePublish, title: 'Publish', onClick: () => onPublish()}
        ])
    }, [context, onPublish])

    useEffect(() => {
        // lets check canvas width
        invariant(canvasRef.current, 'Canvas cannot be empty');
        const {width: canvasWidth} = canvasRef.current.getBoundingClientRect();
        (async () => {
            const canvas = canvasRef.current;
            invariant(canvas, 'Canvas information');
            const ctx = canvas.getContext("2d");
            invariant(ctx, 'Context inline');

            for (const layer of layers) {
                const canvasScale = canvasWidth / layer.viewPortWidth
                const viewportScale = canvasWidth / layer.naturalWidth;
                const canvasHeight = layer.viewPortHeight * canvasScale;
                canvas.height = canvasHeight;
                canvas.width = canvasWidth;

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
    }, [layers])
    return <Vertical h={'100%'} style={{position: "relative"}}>
        <canvas ref={canvasRef}/>
    </Vertical>
}