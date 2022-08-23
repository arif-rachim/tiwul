import {Vertical} from "react-hook-components";
import {Layer} from "./Layer";
import {MutableRefObject, useEffect, useRef} from "react";
import invariant from "tiny-invariant";
import {waitForEvent} from "./waitForEvent";


export function AdjustImageTextPanel(props:{layers: Layer[],canvasRef:MutableRefObject<HTMLCanvasElement|null>}){
    const {layers} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        // lets check canvas width
        invariant(canvasRef.current,'Canvas cannot be empty');
        const {width:canvasWidth} = canvasRef.current.getBoundingClientRect();
        (async () => {
            const canvas = canvasRef.current;
            invariant(canvas,'Canvas information');
            const ctx = canvas.getContext("2d");
            invariant(ctx,'Context inline');

            for (const layer of layers) {
                const canvasScale = canvasWidth / layer.viewPortWidth
                const viewportScale = canvasWidth / layer.naturalWidth;
                const canvasHeight = layer.viewPortHeight * canvasScale;
                canvas.height = canvasHeight;
                canvas.width = canvasWidth;

                const image = new Image();
                image.src = layer.imageData;
                await waitForEvent('load',image);
                const sx = layer.viewPortX;
                const sy = layer.viewPortY;
                const sw = layer.viewPortWidth;
                const sh = layer.viewPortHeight;
                ctx.drawImage(image,sx,sy,sw,sh,0, 0,canvasWidth,canvasHeight);
            }

        })();
    },[layers])
    return <Vertical h={'100%'}>
        <canvas ref={canvasRef}  />
    </Vertical>
}