
import { GET_LECTURES, ITEMS_LOADING } from '../actions/types';

const initialState = {
    lectures: [],
    loading: false
}

export default function(state = initialState, action){

    switch(action.type){

        case GET_LECTURES:
            return {
                ...state,
                lectures: action.payload,
                loading: false
            };
       
        case ITEMS_LOADING:
            return {
                ...state,
                loading: true  
            }

        default:
            return state;
    }

}