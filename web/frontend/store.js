import { createStore } from "redux";

const initialState = {
  isPremiumUser: false,
  orderId: false,
  orderName: false,
  line_items: [],
  planName: "",
  showSetup: true
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_IS_PREMIUM_USER":
      return { ...state, isPremiumUser: action.payload };
    case "SET_PROPS_ORDER_ID":
      return { ...state, orderId: action.payload };
    case "SET_PROPS_ORDER_NAME":
      return { ...state, orderName: action.payload };
    case "SET_PROPS_LINE_ITEMS":
      return { ...state, line_items: action.payload };
    case "SET_PLAN_NAME":
      return { ...state, planName: action.payload };
    case "SET_SHOW_SETUP":
      return { ...state, showSetup: action.payload };
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
