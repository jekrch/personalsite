import { combineReducers } from "redux";
import itemReducer from "./itemReducer";
import lectureReducer from "./lectureReducer";
// {
//     item: itemReducer
// },
export default combineReducers({
  lecture: lectureReducer,
  item: itemReducer
});
