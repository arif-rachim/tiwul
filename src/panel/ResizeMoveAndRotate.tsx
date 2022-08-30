import {Vertical} from "react-hook-components";
import {
    CSSProperties,
    PropsWithChildren,
    TouchEvent as ReactTouchEvent,
    MouseEvent as ReactMouseEvent,
    useEffect,
    useRef
} from "react";
import invariant from "tiny-invariant";
import {degToNum, numToPx, pxToNum} from "./utility";
import {MdRotateRight} from "react-icons/md";
import {IoMdResize} from "react-icons/io";


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
    const isDraggingRef = useRef<HTMLDivElement|null>(null);
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
    const {onChange,children} = props;
    useEffect(() => {
        const element = elementRef.current;
        invariant(element, 'Element target cannot be empty');
        const parentElement = element.parentElement;
        function onMouseMove(event: MouseEvent|TouchEvent) {
            if (isDraggingRef.current === null) {
                return;
            }
            const target = isDraggingRef.current;
            const isTopLeft = target === topLeftAnchor.current;
            const isTopRight = target === topRightAnchor.current;
            const isBottomLeft = target === bottomLeftAnchor.current;
            const isBottomRight = target === bottomRightAnchor.current;
            const isMainAnchor = target === mainAnchor.current;
            const isLeft = target === leftAnchor.current;
            const isRight = target === rightAnchor.current;
            const isTop = target === topAnchor.current;
            const isBottom = target === bottomAnchor.current;
            const isRotation = target === rotationAnchor.current;

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

            invariant(element, 'Element target cannot be empty');
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
            if(isDraggingRef.current === null){
                return;
            }
            isDraggingRef.current = null;
            touchPrevMoveRef.current = undefined;

            const {top,left,height,width,transform} = elementRef.current?.style ?? {top:'0px',left:'0px',height:'0px',width:'0px',transform:''};
            onChange({
                top : pxToNum(top),
                left: pxToNum(left),
                height: pxToNum(height),
                width: pxToNum(width),
                rotation: degToNum(transform)
            });
        }
        invariant(parentElement,'Parent Element cannot be empty');
        parentElement.addEventListener('mousemove',onMouseMove);
        parentElement.addEventListener('mouseup',onMouseUp);
        parentElement.addEventListener('touchmove',onMouseMove);
        parentElement.addEventListener('touchend',onMouseUp);
        return () => {
            parentElement.removeEventListener('mousemove',onMouseMove);
            parentElement.removeEventListener('mouseup',onMouseUp);
            parentElement.removeEventListener('touchmove',onMouseMove);
            parentElement.removeEventListener('touchend',onMouseUp);
        }

    },[onChange]);
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
    }, [children])

    function onMouseDownAnchor(event: ReactTouchEvent|ReactMouseEvent) {
        isDraggingRef.current = event.currentTarget as HTMLDivElement;
    }

    function onMouseDownAndFocus(event: ReactTouchEvent|ReactMouseEvent){
        if(!props.isEditMode){
            isDraggingRef.current = mainAnchor.current;
        }
        props.onFocus(event);
    }

    return <Vertical ref={elementRef} style={{position: 'absolute', ...props.style}} onMouseDown={onMouseDownAndFocus} onTouchStart={onMouseDownAndFocus} >
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
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2,transform:'rotate(90deg)'}}/>
            </Vertical>
            <Vertical ref={topRightAnchor} className={'anchor border'} style={{top: -anchorSize, right: -anchorSize}}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2}}/>
            </Vertical>
            <Vertical ref={bottomLeftAnchor} className={'anchor border'}
                      style={{bottom: -anchorSize, left: -anchorSize}}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2}}/>
            </Vertical>
            <Vertical ref={bottomRightAnchor} className={'anchor border'}
                      style={{bottom: -anchorSize, right: -anchorSize}}
                      onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2,transform:'rotate(90deg)'}}/>
            </Vertical>
            <Vertical ref={topAnchor} className={'anchor border'} style={{
                top: -anchorSize,
                marginLeft: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2,transform:'rotate(-45deg)'}}/>
            </Vertical>
            <Vertical ref={bottomAnchor} className={'anchor border'} style={{
                bottom: -anchorSize,
                marginLeft: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2,transform:'rotate(-45deg)'}}/>
            </Vertical>
            <Vertical ref={leftAnchor} className={'anchor border'} style={{
                left: -anchorSize,
                top: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2,transform:'rotate(45deg)'}}/>
            </Vertical>
            <Vertical ref={rightAnchor} className={'anchor border'} style={{
                right: -anchorSize,
                top: `calc(50% - ${anchorSize/2}px)`,
            }} onMouseDown={onMouseDownAnchor} onTouchStart={onMouseDownAnchor}>
                <IoMdResize style={{fontSize:16,margin:2,transform:'rotate(45deg)'}}/>
            </Vertical>


            <Vertical ref={rotationAnchor} className={'anchor border'}
                      style={{
                          top: -anchorSize * 3,
                          marginLeft: `calc(50% - ${anchorSize/2}px)`,
                      }}
                      onMouseDown={onMouseDownAnchor}
                      onTouchStart={onMouseDownAnchor}
            >
                <MdRotateRight style={{fontSize:20}}/>
            </Vertical>

        </Vertical>

    </Vertical>
}