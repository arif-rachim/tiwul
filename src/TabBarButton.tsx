import {IconType} from "react-icons";
import {Vertical} from "react-hook-components";
import React from "react";

export function TabBarButton(props: { onClick: () => void, title: string, icon: IconType }) {
    const Icon = props.icon;
    return <Vertical style={{
        padding: "0.5rem",
        cursor: "pointer",
        flexGrow:1
    }} onClick={props.onClick}>
        <Vertical style={{color: 'rgba(255,255,255,0.9)'}} hAlign={"center"}>
            <Icon style={{fontSize: "3rem"}}/>
            <Vertical style={{fontSize: "0.8rem"}}>
                {props.title}
            </Vertical>
        </Vertical>
    </Vertical>;
}