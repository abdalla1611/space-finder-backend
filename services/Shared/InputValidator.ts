
import { Space,Reservation } from "./Model";

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

export function validateAsReservationEntry(arg: any) {

    if(!(arg as Reservation).reservationId){
        throw new MissingFieldErorr('Value for reservationId required!');
    }
    if(!(arg as Reservation).spaceId){
        throw new MissingFieldErorr('Value for spaceId required!');
    }
    if(!(arg as Reservation).state){
        throw new MissingFieldErorr('Value for state required!');
    }
    if(!(arg as Reservation).user){
        throw new MissingFieldErorr('Value for user required!');
    }

}