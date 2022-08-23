export function waitForEvent(eventName:string,target:{addEventListener:(eventName:string,callback:(event:any) => void) =>void,removeEventListener:(eventName:string,callback:(event:any) => void) =>void}){
    return new Promise((resolve) => {
        function callback(event:any){
            resolve(event)
            target.removeEventListener(eventName,callback);
        }
        target.addEventListener(eventName,callback);
    })

}