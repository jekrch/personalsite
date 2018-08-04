import { GET_LECTURES, ITEMS_LOADING } from "./types";
import axios from "axios";

export const getLectures = () => dispatch => {
  dispatch(setLecturesLoading());
  axios.get("/api/lectures").then(res =>
    dispatch({
      type: GET_LECTURES,
      payload: res.data
    })
  );
};

export const setLecturesLoading = () => {
  return {
    type: ITEMS_LOADING
  };
};
