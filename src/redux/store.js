import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userReducer";
import calendarReducer from "./calendarReducer";

const store = configureStore({
  reducer: {
    user: userReducer, 
    calendar: calendarReducer
  },
});

export default store; 
