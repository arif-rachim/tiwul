import {Vertical} from "react-hook-components";
import React, {ChangeEvent, useContext, useEffect, useRef} from "react";
import {AppContext, ViewState} from "../App";
import invariant from "tiny-invariant";
import {MdInsertPhoto} from "react-icons/md";
import {Layer} from "./Layer";
import {v4} from "uuid";



/**
 <TabBarButton onClick={() => fileInputRef?.current?.click()} title={'Select Image'}
 icon={MdInsertPhoto}/>
 * @constructor
 */
export default function DashboardPanel() {
    const context = useContext(AppContext);
    invariant(context, 'AppContext cannot be empty');
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {

        context.setTabMenu([
            {
                icon: MdInsertPhoto, title: 'Select Image', onClick: () => fileInputRef?.current?.click()
            }
        ])
    }, [context]);

    async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
        invariant(event.target.files, 'Files is not available');

        const files = Array.from(event.target.files);
        const fileSources: Layer[] = await Promise.all(files.map(file => new Promise<Layer>(resolve => {
            const fileReader = new FileReader()

            function onReaderLoad() {
                const imageData = fileReader?.result?.toString() ?? '';
                const image = new Image();
                image.src = imageData;

                function onImageLoaded() {
                    const {naturalWidth, naturalHeight} = image;
                    const layer: Layer = {
                        id: v4(),
                        imageData: imageData,
                        naturalWidth,
                        naturalHeight,
                        viewPortHeight: 0,
                        viewPortWidth: 0,
                        viewPortX: 0,
                        viewPortY: 0
                    }
                    image.removeEventListener('load', onImageLoaded);
                    resolve(layer);
                }

                image.addEventListener('load', onImageLoaded);
                fileReader.removeEventListener('load', onReaderLoad);
            }

            fileReader.addEventListener('load', onReaderLoad);
            fileReader.readAsDataURL(file);
        })));
        invariant(context, 'AppContext cannot be empty');
        context.setLayers(old => [...old, ...fileSources]);
        context.setViewState(ViewState.ImageSelected);
    }

    return <Vertical h={'100%'}>
        <input type={"file"} onChange={onFileSelected}
               style={{display: 'none'}}
               ref={fileInputRef}
               accept=".jpg, .png, .jpeg, .gif"
        />

        {/*<ResizeMoveAndRotate >*/}
        {/*    <Vertical  style={{width:'100%',height:'100%',minWidth:80,minHeight:20,border:'1px solid rgba(0,0,0,0.9)'}}></Vertical>*/}
        {/*</ResizeMoveAndRotate>*/}
    </Vertical>
}