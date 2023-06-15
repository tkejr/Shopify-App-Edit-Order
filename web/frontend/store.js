import { createStore } from "redux";

const initialState = {
  isPremiumUser: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_IS_PREMIUM_USER":
      return { ...state, isPremiumUser: action.payload };
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;