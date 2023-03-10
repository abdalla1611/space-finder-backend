
import { Space } from "./Model";

export class MissingFieldErorr extends Error{}

export function validateAsSpaceEntry(arg: any) {

    if(!(arg as Space).name){
        throw new MissingFieldErorr('Value for name required!');
    }
    if(!(arg as Space).spaceId){
        throw new MissingFieldErorr('Value for spaceId required!');
    }
    if(!(arg as Space).location){
        throw new MissingFieldErorr('Value for location required!');
    }

}