export function waitForEvent(eventName: string, target: { addEventListener: (eventName: string, callback: (event: any) => void) => void, removeEventListener: (eventName: string, callback: (event: any) => void) => void }) {
    return new Promise((resolve) => {
        function callback(event: any) {
            resolve(event)
            target.removeEventListener(eventName, callback);
        }

        target.addEventListener(eventName, callback);
    })

}

export function numToPx(value: number) {
    return `${value}px`;
}

export function pxToNum(value:string){
    if(value === ''){
        return 0;
    }
    return parseInt(value.replace('px',''));
}

export function degToNum(value?:string){
    if(value === undefined || value === ''){
        return 0;
    }
    const rotateString = 'rotate(';
    const endString = 'deg)';
    const startingIndex = value.indexOf(rotateString)+rotateString.length;
    const endingIndex = value.indexOf(endString,startingIndex);
    return parseInt(value.substring(startingIndex,endingIndex));
}
