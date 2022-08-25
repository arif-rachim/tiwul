import {Vertical} from "react-hook-components";
import {CSSProperties, PointerEvent as ReactPointerEvent, PropsWithChildren, useEffect, useRef, useState,TouchEvent as ReactTouchEvent} from "react";
import invariant from "tiny-invariant";
import {degToNum, numToPx, pxToNum} from "./utility";
import {IoMdResize} from "react-icons/io";
import {MdCheck} from "react-icons/md";

const checkDistance = (event:ReactTouchEvent|TouchEvent) => {
    return Math.hypot(event.touches[0].pageX - event.touches[1].pageX,event.touches[0].pageY - event.touches[1].pageY);
}
export default function ResizeMoveAndRotate(props: PropsWithChildren<{style:CSSProperties,onChange:(rect:{width:number,height:number,top:number,left:number,rotation:number}) => void}>) {
    const isDraggingRef = useRef<boolean>(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const topLeftAnchor = useRef<HTMLDivElement>(null);
    const bottomLeftAnchor = useRef<HTMLDivElement>(null);
    const topRightAnchor = useRef<HTMLDivElement>(null);
    const bottomRightAnchor = useRef<HTMLDivElement>(null);
    const mainAnchor = useRef<HTMLDivElement>(null);

    const topAnchor = useRef<HTMLDivElement>(null);
    const leftAnchor = useRef<HTMLDivElement>(null);
    const rightAnchor = useRef<HTMLDivElement>(null);
    const bottomAnchor = useRef<HTMLDivElement>(null);
    const [editMode, setEditMode] = useState<boolean>(false);

    useEffect(() => {
        const element = elementRef.current;
        invariant(element, 'Element cannot be empty');

        const {width, height} = element.getBoundingClientRect() ?? {width: 0, height: 0};
        if(!element.style.width){
            element.style.width = width + 'px';
        }
        if(!element.style.height){
            element.style.height = height + 'px';
        }


    }, [props.children])

    function onMouseDownAnchor(event: ReactPointerEvent) {
        const isTopLeft = event.target === topLeftAnchor.current;
        const isTopRight = event.target === topRightAnchor.current;
        const isBottomLeft = event.target === bottomLeftAnchor.current;
        const isBottomRight = event.target === bottomRightAnchor.current;
        const isMainAnchor = event.target === mainAnchor.current;
        const isLeft = event.target === leftAnchor.current;
        const isRight = event.target === rightAnchor.current;
        const isTop = event.target === topAnchor.current;
        const isBottom = event.target === bottomAnchor.current;
        const element = elementRef.current;
        invariant(element, 'Element cannot be empty');

        isDraggingRef.current = isTopLeft || isTopRight || isBottomLeft || isBottomRight || isLeft || isRight || isTop || isBottom || isMainAnchor;

        function onMouseMove(event: PointerEvent) {
            if (!isDraggingRef.current) {
                return;
            }
            const {movementX, movementY} = event;


            invariant(element, 'Element target cannot be emtpy');

            if (isTopLeft || isMainAnchor || isLeft || isTop) {
                element.style.top = numToPx(pxToNum(element.style.top) + movementY);
                element.style.left = numToPx(pxToNum(element.style.left) + movementX);
            }
            if (isBottomLeft || isBottom) {
                element.style.height = numToPx(pxToNum(element.style.height) + movementY);
            }
            if (isRight) {
                element.style.width = numToPx(pxToNum(element.style.width) + movementX);
            }
            if (isTopRight) {
                const rotating = degToNum(element.style.transform) + movementY;
                element.style.transform = `rotate(${rotating}deg)`;
            }
            if (isBottomRight) {
                element.style.height = numToPx(pxToNum(element.style.height) + movementY);
                element.style.width = numToPx(pxToNum(element.style.width) + movementX);
            }
        }

        function onMouseUp() {
            isDraggingRef.current = false;
            window.removeEventListener('pointermove', onMouseMove);
        }

        window.addEventListener('pointerup', onMouseUp, {once: true});
        window.addEventListener('pointermove', onMouseMove);
    }

    const startRef = useRef({x:0,y:0,distance:0});
    function onTouchStart(event:ReactTouchEvent){
        if(event.touches.length !== 2){
            return;
        }
        startRef.current.x = event.touches[0].pageX + event.touches[1].pageX;
        startRef.current.y = event.touches[0].pageY + event.touches[1].pageY;
        startRef.current.distance = checkDistance(event);

        function onTouchMove(event:TouchEvent){
            if(event.touches.length === 2){
                event.preventDefault();
            }
            let scale:number ;
            if('scale' in event){
                scale = (event as any).scale;
            }else{
                const deltaDistance = checkDistance(event);
                scale = deltaDistance / startRef.current.distance;
            }
            const imageElementScale = Math.min(Math.max(1,scale),4);

            const deltaX = (((event.touches[0].pageX + event.touches[1].pageX) / 2) - startRef.current.x) * 2;
            const deltaY = (((event.touches[0].pageY + event.touches[1].pageY) / 2) - startRef.current.y) * 2;
            const element = elementRef.current;
            invariant(element,'Element cannot be empty');
            const transform = `translate3d(${deltaX}px,${deltaY}px,0) scale(${imageElementScale})`;

            element.style.transform = transform;
            element.style.zIndex = "9999";
        }
        function onTouchEnd(event:TouchEvent){


            window.removeEventListener('touchmove',onTouchMove);
            window.removeEventListener('touchend',onTouchEnd);
        }
        window.addEventListener('touchmove',onTouchMove);
        window.addEventListener('touchend',onTouchEnd);
    }

    return <Vertical ref={elementRef} style={{position: 'absolute',...props.style}} onTouchStart={onTouchStart}>
        {props.children}
        {!editMode && <Vertical style={{right: 0, top: 0, position: 'absolute'}} className={'darken-when-hover'}
                                onClick={() => setEditMode(true)}>
            <IoMdResize/>
        </Vertical>}
        {editMode &&
            <Vertical w={'100%'} h={'100%'} style={{position: 'absolute'}}>
                <Vertical ref={topLeftAnchor} className={'anchor'} style={{top: -5, left: -5, width: 10, height: 10}}
                          onPointerDown={onMouseDownAnchor} />
                <Vertical ref={topRightAnchor} className={'anchor'} style={{top: -5, right: -5, width: 10, height: 10}}
                          onPointerDown={onMouseDownAnchor}/>
                <Vertical ref={bottomLeftAnchor} className={'anchor'}
                          style={{bottom: -5, left: -5, width: 10, height: 10}}
                          onPointerDown={onMouseDownAnchor}/>
                <Vertical ref={bottomRightAnchor} className={'anchor'}
                          style={{bottom: -5, right: -5, width: 10, height: 10}}
                          onPointerDown={onMouseDownAnchor}/>
                <Vertical ref={topAnchor} className={'anchor'} style={{
                    top: -5,
                    left: 5,
                    right: 5,
                    height: 10,
                    position: 'absolute'
                }} onPointerDown={onMouseDownAnchor}/>
                <Vertical ref={bottomAnchor} className={'anchor'} style={{
                    bottom: -5,
                    left: 5,
                    right: 5,
                    height: 10,
                    position: 'absolute'
                }} onPointerDown={onMouseDownAnchor}/>
                <Vertical ref={leftAnchor} className={'anchor'} style={{
                    left: -5,
                    top: 5,
                    bottom: 5,
                    width: 10,
                    position: 'absolute'
                }} onPointerDown={onMouseDownAnchor}/>
                <Vertical ref={rightAnchor} className={'anchor'} style={{
                    right: -5,
                    top: 5,
                    bottom: 5,
                    width: 10,
                    position: 'absolute'
                }} onPointerDown={onMouseDownAnchor}/>
                <Vertical ref={mainAnchor} className={'anchor'}
                          style={{
                              top: 5,
                              left: 5,
                              bottom: 5,
                              right: 5,
                              position: 'absolute'
                          }}
                          onPointerDown={onMouseDownAnchor}/>

            </Vertical>
        }
        {editMode && <Vertical style={{right: 0, top: 0, position: 'absolute'}} className={'darken-when-hover'}
                                onClick={() => {
                                    setEditMode(false);
                                    const element = elementRef.current;
                                    invariant(element);
                                    const {width,height,left,top} = element.style;
                                    const rotation = degToNum(element.style?.transform);
                                    const event = {rotation,width:pxToNum(width),height:pxToNum(height),left:pxToNum(left),top:pxToNum(top)};

                                    props.onChange(event);
                                }}>
            <MdCheck/>
        </Vertical>}
    </Vertical>
}