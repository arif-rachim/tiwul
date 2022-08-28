import {Vertical} from "react-hook-components";
import {TextLayer} from "../App";
import React from "react";

export default function ViewImagePanel(props:{textLayers:TextLayer[],imageLayers:string[]}){
    return <Vertical h={'100%'} style={{position: "relative"}}>
        <img src={props.imageLayers[0]} alt=""/>
        <Vertical w={'100%'} h={'100%'} style={{position: 'absolute'}} >
            {props.textLayers.map((textLayer:TextLayer) => {
                return <input key={textLayer.id} style={{
                    width:textLayer.width,
                    height:textLayer.height,
                    transform:`rotate(${textLayer.rotation}deg)`,
                    top:textLayer.top,
                    left:textLayer.left,
                    fontFamily:textLayer.fontFamily,
                    fontSize:textLayer.fontSize,
                    position : 'absolute'
                }}/>
            })}
        </Vertical>
    </Vertical>
}