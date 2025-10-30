import { SIGNAL_EVENTS } from "../Events/signalEvents";

const eventBus={
    dispatch(event,data){
          console.log("Dispatching Event:", event, data); 
        window.dispatchEvent(new CustomEvent(event,{detail:data}));
        
    },
    on(event,callback){
        window.addEventListener(event,(e)=>callback(e.detail));
    },
    off(event,callback){
        window.addEventListener(event,callback);
    }
}
console.log(eventBus)

export default eventBus;