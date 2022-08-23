import {IconType} from "react-icons";
import {Vertical} from "react-hook-components";
import React from "react";

export function TabBarButton(props: { onClick: () => void, title: string, icon: IconType }) {
    const Icon = props.icon;
    return <Vertical style={{
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: "0.5rem",
        cursor: "pointer",
        boxShadow: "0 5px 3px -2px rgba(0,0,0,0.05)"
    }} onClick={props.onClick}>
        <Vertical style={{color: "deepskyblue"}} hAlign={"center"}>
            <Icon style={{fontSize: "3rem"}}/>
            <Vertical style={{fontSize: "0.8rem"}}>
                {props.title}
            </Vertical>
        </Vertical>
    </Vertical>;
}