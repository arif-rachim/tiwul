import {Vertical} from "react-hook-components";
import {AppContext, TextLayer} from "../App";
import React, {useContext, useEffect} from "react";
import invariant from "tiny-invariant";

export default function ViewImagePanel(props: { textLayers: TextLayer[], imageLayers: string[], canvasDimension: { width: number, height: number } }) {
    const {width, height} = props.canvasDimension;
    const context = useContext(AppContext);
    useEffect(() => {
        invariant(context,'Context cannot be null');
        context.setTabMenu([]);
    },[context]);
    return <Vertical h={'100%'} style={{position: "relative"}} hAlign={'center'} vAlign={'center'}>
        <Vertical style={{width, height, position: 'relative',boxShadow:'0px 0px 10px 0px rgba(0,0,0,0.5)'}}>
            <img src={props.imageLayers[0]} alt="" width={width} height={height}/>
            <Vertical w={'100%'} h={'100%'} style={{position: 'absolute', width, height}}>
                {props.textLayers.map((textLayer: TextLayer) => {
                    return <input className={'input'} key={textLayer.id} style={{
                        width: textLayer.width,
                        height: textLayer.height,
                        transform: `rotate(${textLayer.rotation}deg)`,
                        top: textLayer.top,
                        left: textLayer.left,
                        fontFamily: textLayer.fontFamily,
                        fontSize: textLayer.fontSize,
                        position: 'absolute'
                    }}/>
                })}
            </Vertical>
        </Vertical>
    </Vertical>
}