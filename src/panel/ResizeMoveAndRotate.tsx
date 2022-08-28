import {Vertical} from "react-hook-components";
import {
    CSSProperties,
    PointerEvent as ReactPointerEvent,
    PropsWithChildren,
    TouchEvent as ReactTouchEvent,
    MouseEvent as ReactMouseEvent,
    useEffect,
    useRef
} from "react";
import invariant from "tiny-invariant";
import {degToNum, numToPx, pxToNum} from "./utility";

const checkDistance = (event: ReactTouchEvent | TouchEvent) => {
    return Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY);
}
interface TouchPosition{
    pageX:number;
    pageY:number;
}
const anchorSize = 20;
export default function ResizeMoveAndRotate(props: PropsWithChildren<{
    style: CSSProperties,
    onChange: (rect: { width: number, height: number, top: number, left: number, rotation: number }) => void,
    onFocus : (event:ReactMouseEvent|ReactTouchEvent) => void,
    isEditMode:boolean
}>) {
    const isDraggingRef = useRef<boolean>(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const topLeftAnchor = useRef<HTMLDivElement>(null);
    const bottomLeftAnchor = useRef<HTMLDivElement>(null);
    const topRightAnchor = useRef<HTMLDivElement>(null);
    const bottomRightAnchor = useRef<HTMLDivElement>(null);
    const mainAnchor = useRef<HTMLDivElement>(null);
    const rotationAnchor = useRef<HTMLDivElement>(null);

    const topAnchor = useRef<HTMLDivElement>(null);
    const leftAnchor = useRef<HTMLDivElement>(null);
    const rightAnchor = useRef<HTMLDivElement>(null);
    const bottomAnchor = useRef<HTMLDivElement>(null);
    const touchPrevMoveRef = useRef<TouchPosition|undefined>();
    useEffect(() => {
        const element = elementRef.current;
        invariant(element, 'Element cannot be empty');

        const {width, height} = element.getBoundingClientRect() ?? {width: 0, height: 0};
        if (!element.style.width) {
            element.style.width = width + 'px';
        }
        if (!element.style.height) {
            element.style.height = height + 'px';
        }

    }, [props.children])

    function onMouseDownAnchor(event: ReactTouchEvent|ReactMouseEvent) {

        const isTopLeft = event.target === topLeftAnchor.current;
        const isTopRight = event.target === topRightAnchor.current;
        const isBottomLeft = event.target === bottomLeftAnchor.current;
        const isBottomRight = event.target === bottomRightAnchor.current;
        const isMainAnchor = event.target === mainAnchor.current;
        const isLeft = event.target === leftAnchor.current;
        const isRight = event.target === rightAnchor.current;
        const isTop = event.target === topAnchor.current;
        const isBottom = event.target === bottomAnchor.current;
        const isRotation = event.target === rotationAnchor.current;
        const element = elementRef.current;
        invariant(element, 'Element cannot be empty');

        isDraggingRef.current = isTopLeft || isTopRight || isBottomLeft || isBottomRight || isLeft || isRight || isTop || isBottom || isMainAnchor || isRotation;

        function onMouseMove(event: MouseEvent|TouchEvent) {
            if (!isDraggingRef.current) {
                return;
            }
            let movementX = 0;
            let movementY = 0;
            if('touches' in event){
                let {pageX,pageY} = event.touches[0];
                pageX = Math.round(pageX);
                pageY = Math.round(pageY);
                if(touchPrevMoveRef.current){
                    movementY = pageY - touchPrevMoveRef.current.pageY;
                    movementX = pageX - touchPrevMoveRef.current.pageX;
                }
                touchPrevMoveRef.current = {pageX,pageY};
            }else{
                movementX = event.movementX;
                movementY = event.movementY;
            }

            invariant(element, 'Element target cannot be emtpy');
            if (isTopLeft) {
                element.style.top = numToPx(pxToNum(element.style.top) + movementY);
                element.style.height = numToPx(pxToNum(element.style.height) - movementY);
                element.style.left = numToPx(pxToNum(element.style.left) + movementX);
                element.style.width = numToPx(pxToNum(element.style.width) - movementX);
            }
            if (isTop) {
                element.style.height = numToPx(pxToNum(element.style.height) - movementY);
                element.style.top = numToPx(pxToNum(element.style.top) + movementY);
            }
            if (isLeft) {
                element.style.width = numToPx(pxToNum(element.style.width) - movementX);
                element.style.left = numToPx(pxToNum(element.style.left) + movementX);
            }
            if (isMainAnchor) {
                element.style.top = numToPx(pxToNum(element.style.top) + movementY);
                element.style.left = numToPx(pxToNum(element.style.left) + movementX);
            }
            if (isBottom) {
                element.style.height = numToPx(pxToNum(element.style.height) + movementY);
            }
            if (isBottomLeft) {
                element.style.left = numToPx(pxToNum(element.style.left) + movementX);
                element.style.height = numToPx(pxToNum(element.style.height) + movementY);
                element.style.width = numToPx(pxToNum(element.style.width) - movementX);
            }
            if (isRight) {
                element.style.width = numToPx(pxToNum(element.style.width) + movementX);
            }
            if (isTopRight) {
                element.style.height = numToPx(pxToNum(element.style.height) - movementY);
                element.style.width = numToPx(pxToNum(element.style.width) + movementX);
                element.style.top = numToPx(pxToNum(element.style.top) + movementY);
            }
            if (isRotation) {
                const negation = movementX / Math.abs(movementX);
                const rotating = degToNum(element.style.transform) + (Math.hypot(movementX,movementY) * negation);
                element.style.transform = `rotate(${rotating}deg)`;
            }
            if (isBottomRight) {
                element.style.height = numToPx(pxToNum(element.style.height) + movementY);
                element.style.width = numToPx(pxToNum(element.style.width) + movementX);
            }
        }

        function onMouseUp() {

            isDraggingRef.current = false;
            touchPrevMoveRef.current = undefined;

            const {top,left,height,width,transform} = elementRef.current?.style ?? {top:'0px',left:'0px',height:'0px',width:'0px',transform:''};

            props.onChange({
                top : pxToNum(top),
                left: pxToNum(left),
                height: pxToNum(height),
                width: pxToNum(width),
                rotation: degToNum(transform)
            });
            window.removeEventListener('mouseup', onMouseUp, );
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp, );
            window.removeEventListener('touchmove', onMouseMove);
        }

        window.addEventListener('mouseup', onMouseUp, );
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchend', onMouseUp, );
        window.addEventListener('touchmove', onMouseMove);
    }

    const startRef = useRef({x: 0, y: 0, distance: 0});

    function onTouchStart(event: ReactTouchEvent) {
        if (event.touches.length !== 2) {
            return;
        }
        startRef.current.x = event.touches[0].pageX + event.touches[1].pageX;
        startRef.current.y = event.touches[0].pageY + event.touches[1].pageY;
        startRef.current.distance = checkDistance(event);

        function onTouchMove(event: TouchEvent) {
            if (event.touches.length === 2) {
                event.preventDefault();
            }
            let scale: number;
            if ('scale' in event) {
                scale = (event as any).scale;
            } else {
                const deltaDistance = checkDistance(event);
                scale = deltaDistance / startRef.current.distance;
            }
            const imageElementScale = Math.min(Math.max(1, scale), 4);

            const deltaX = (((event.touches[0].pageX + event.touches[1].pageX) / 2) - startRef.current.x) * 2;
            const deltaY = (((event.touches[0].pageY + event.touches[1].pageY) / 2) - startRef.current.y) * 2;
            const element = elementRef.current;
            invariant(element, 'Element cannot be empty');
            const transform = `translate3d(${deltaX}px,${deltaY}px,0) scale(${imageElementScale})`;

            element.style.transform = transform;
            element.style.zIndex = "9999";
        }

        function onTouchEnd(event: TouchEvent) {


            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        }

        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);
    }

    return <Vertical ref={elementRef} style={{position: 'absolute', ...props.style}} onMouseDown={props.onFocus} onTouchStart={props.onFocus} >
        {props.children}
        <Vertical w={'100%'} h={'100%'} style={{position: 'absolute',display:props.isEditMode?'flex':'none'}} >
            <Vertical ref={mainAnchor}
                      style={{
                          top: 3,
                          left: 3,
                          bottom: 3,
                          right: 3,
                          position: 'absolute'
                      }}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={topLeftAnchor} className={'anchor border'} style={{top: -anchorSize, left: -anchorSize}}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={topRightAnchor} className={'anchor border'} style={{top: -anchorSize, right: -anchorSize}}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={bottomLeftAnchor} className={'anchor border'}
                      style={{bottom: -anchorSize, left: -anchorSize}}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={bottomRightAnchor} className={'anchor border'}
                      style={{bottom: -anchorSize, right: -anchorSize}}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={topAnchor} className={'anchor border'} style={{
                top: -anchorSize,
                marginLeft: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={bottomAnchor} className={'anchor border'} style={{
                bottom: -anchorSize,
                marginLeft: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={leftAnchor} className={'anchor border'} style={{
                left: -anchorSize,
                top: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>
            <Vertical ref={rightAnchor} className={'anchor border'} style={{
                right: -anchorSize,
                top: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}/>


            <Vertical ref={rotationAnchor} className={'anchor border'}
                      style={{
                          top: -anchorSize * 3,
                          marginLeft: `calc(50% - ${anchorSize/2}px)`,
                      }}
                      onMouseDown={onMouseDownAnchor}
                      onTouchStart={onMouseDownAnchor}
            />

        </Vertical>

    </Vertical>
}