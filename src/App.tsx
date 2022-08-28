import React, {createContext, Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from 'react';
import './App.css';
import {Horizontal, Vertical} from "react-hook-components";
import {TabBarButton} from "./TabBarButton";
import {Layer} from "./panel/Layer";
import {CropImagePanel} from "./panel/CropImagePanel";
import {AdjustImageTextPanel} from "./panel/AdjustImageTextPanel";
import {IconType} from "react-icons";
import DashboardPanel from "./panel/DashboardPanel";
import {v4} from "uuid";
import {waitForEvent} from "./panel/utility";
import ViewImagePanel from "./panel/ViewImagePanel";

export const IMAGE_SERVER_VIEWER = 'https://i.ibb.co/';
export const IMAGE_SERVER_UPLOAD = `https://api.imgbb.com/1/upload`;
export const HOST_ADDRESS = 'http://localhost:3000';
export const IMAGE_PATH_URI_SEPARATOR = '/image/';
export enum ViewState {
    Initial,
    ImageSelected,
    ImageSaved,
    ViewImage
}

interface Image {
    filename: string,//'d84bdd6a0bbd.png',
    name: string,//'d84bdd6a0bbd',
    mime: string,//'image/png',
    extension: string,//'png',
    url: string//'https://i.ibb.co/khhZwCG/d84bdd6a0bbd.png'
}

interface Thumb {
    filename: string,// 'd84bdd6a0bbd.png',
    name: string,// 'd84bdd6a0bbd',
    mime: string,// 'image/png',
    extension: string,// 'png',
    url: string// 'https://i.ibb.co/mHHp2WR/d84bdd6a0bbd.png'
}

export interface ImageData {
    delete_url: string,//"https://ibb.co/mHHp2WR/a8533ad87f6417058c3b0b14275385a3"
    display_url: string,//"https://i.ibb.co/khhZwCG/d84bdd6a0bbd.png"
    expiration: string,//"600"
    height: string,//"215"
    id: string,//"mHHp2WR"
    image: Image
    size: number,//86813
    thumb: Thumb
    time: string,//"1661279314"
    title: string,//"d84bdd6a0bbd"
    url: string,//"https://i.ibb.co/khhZwCG/d84bdd6a0bbd.png"
    url_viewer: string,//"https://ibb.co/mHHp2WR"
    width: string,//"375"
}

interface TabMenuItem {
    onClick: () => void,
    title: string,
    icon: IconType
}

export const AppContext = createContext<{
    setTabMenu: Dispatch<SetStateAction<TabMenuItem[]>>,
    setLayers: Dispatch<SetStateAction<Layer[]>>,
    setViewState: Dispatch<SetStateAction<ViewState>>
    setTextLayers: Dispatch<SetStateAction<TextLayer[]>>
} | null>(null);

export interface TextLayer{
    id:string;
    width:number;
    height:number;
    top : number;
    left :number;
    rotation:number;
    fontSize:number;
    fontFamily:string;
}

function App() {
    const [viewState, setViewState] = useState<ViewState>(ViewState.Initial);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
    const [imageLayers,setImageLayers] = useState<string[]>([]);
    const blockRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tabMenu, setTabMenu] = useState<TabMenuItem[]>([]);
    const contextValue = useMemo(() => ({setTabMenu, setLayers, setViewState,setTextLayers}),[]);
    useEffect(() => {
        const pathName = window.location.pathname;
        const renderingTheImage = pathName.endsWith('.png');
        if(!renderingTheImage){
            return;
        }

        const [textLayers,imageUrl] = pathName.split('/image/');
        const layers = textLayers.substring(1,textLayers.length).split('/').reduce((result:TextLayer[],value:string,index:number,array:string[]) => {
            if(index % 5 === 0 && array.length >= index + 5){
                debugger;
                const [top,left,height,width,rotation] = array.slice(index,index+5);
                result.push({
                    top:parseInt(top),
                    left:parseInt(left),
                    height:parseInt(height),
                    width:parseInt(width),
                    rotation:parseInt(rotation),
                    id : v4(),
                    fontFamily:'',
                    fontSize:12
                })
            }
            return result;
        },[])
        setTextLayers(layers);
        setImageLayers([`${IMAGE_SERVER_VIEWER}${imageUrl}`]);
        setViewState(ViewState.ViewImage);
    },[]);
    return (<AppContext.Provider value={contextValue}>
        <Vertical h={'100%'} style={{position: 'relative'}} overflow={'hidden'}>
            <Vertical h={'100%'} position={'relative'} overflow={'hidden'}>
                {viewState === ViewState.Initial && <DashboardPanel/>}
                {viewState === ViewState.ImageSelected && <CropImagePanel layers={layers} blockRef={blockRef}/>}
                {viewState === ViewState.ImageSaved && <AdjustImageTextPanel layers={layers} textLayers={textLayers} canvasRef={canvasRef}/>}
                {viewState === ViewState.ViewImage && <ViewImagePanel textLayers={textLayers} imageLayers={imageLayers} />}
            </Vertical>
            <Horizontal hAlign={'center'} style={{borderTop:'1px solid rgba(255,255,255,0.5)',boxShadow:'0 20px 40px -30px rgba(255,255,255,0.4) inset'}} >
                {tabMenu.map(menu => {
                    return <TabBarButton key={menu.title} onClick={menu.onClick} title={menu.title} icon={menu.icon}/>
                })}
            </Horizontal>
        </Vertical></AppContext.Provider>);
}


export default App;
