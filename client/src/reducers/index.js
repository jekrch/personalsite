import { combineReducers } from "redux";
import lectureReducer from "./lectureReducer";

export default combineReducers({
  lecture: lectureReducer
});
