import { createStore } from "redux";

const initialState = {
  isPremiumUser: false,
  orderId: false,
  orderName: false, 
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_IS_PREMIUM_USER":
      return { ...state, isPremiumUser: action.payload };
    case "SET_PROPS_ORDER_ID":
      return { ...state, orderId: action.payload };
    case "SET_PROPS_ORDER_NAME":
        return { ...state, orderName: action.payload };
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;