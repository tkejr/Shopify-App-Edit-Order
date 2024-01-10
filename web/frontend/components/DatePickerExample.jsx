import {
  DatePicker,
  TextContainer,
 
  LegacyCard,
  Toast,
  Frame,
  Page,
  Button,
  Banner,
} from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { useSelector, useDispatch } from "react-redux";
import ErrorBanner from "../components/ErrorBanner";

export function DatePickerExample(props) {
  const emptyToastProps = { content: null };
  const [active, setActive] = useState(false);
  const [orderNameNative, setOrderNameNative] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);

  const [error, setError] = useState(false);
  
  const orderId =  useSelector((state) => state.orderId);
  const orderName = useSelector((state) => state.orderName);
  const dispatch = useDispatch();

  //newCode
  const getOrderName = async () => {
   
    
      fetch("/api/orderName/" + orderId)
      .then((response) => response.json())
      .then((json) => {
        setOrderNameNative(json);
        //console.log("=======",json)
      });
    
    
  };
  const handleError = () => {
    setError(!error);
  };
  var title = "Please  Click on Order Number";
  
  /*
  if (orderName) {
    title = "Please Select a Date for " + orderName;
  }
  */
 
  if(orderNameNative !== "none" && orderNameNative !== undefined){

    title = "Please Select a Date for " + orderNameNative;
  }
  if (orderName) {
    title = "Please Select a Date for " + orderName;
  }
  
  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const fetch = useAuthenticatedFetch();
  const currentDate = new Date();

  const [{ month, year }, setDate] = useState({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date("November 17, 2025 03:24:00"),
    end: new Date("November 17, 2025 03:24:00"),
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );
  useEffect(()=>{
    if(orderId){
      getOrderName();
    }
    
  },[])
  const ConvertDate = (date) => {
    const convertedDate = new Date(date).toISOString();
    return convertedDate;
  };

  const submitDate = () => {
    let defaultDate = new Date("November 17, 2025 03:24:00");

    if (
      selectedDates.start.getFullYear() === defaultDate.getFullYear() &&
      selectedDates.start.getMonth() === defaultDate.getMonth() &&
      selectedDates.start.getDate() === defaultDate.getDate()
    ) {
      //Banner error, but smaller one
      props.setErrorContent("Remember to choose an order date as well");
      props.setButtonText("");
      props.handleError();
      return;
    }
    setOrderNameNative("none")
    updateOrder(orderId, ConvertDate(selectedDates.start));
    dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
    dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
  };
  const updateOrder = async (id, newDate) => {
    //make sure you are passing them in correctly, the date needs to be the correct date format as a string
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate }),
    };
    // I did the one which has variable id's, not hardcoded, but it probably does not work as is

    setIsLoading(true);
    const response = await fetch("/api/orders/" + id, requestOptions);
  
    if (response.ok) {
      setToastProps({ content: "Date Updated" });
      props.setReloadComp(!props.reloadComp);
    } else {
      setIsLoading(false);
      //Banner error
     //console.log('=== eror',response)
      props.setErrorContent(
        "There was an error updating the date. Make sure the order you are trying to backdate has a shipping and billing address. If the error persists, contact support: "
      );

      //props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.setButtonText("Contact Support")
      props.handleError();
    }
  };

  return (
    <Frame>
      <LegacyCard title={title} sectioned>
        <TextContainer spacing="loose" id="section-1">
          <p>
            You can Backdate an order by selecting a date from the calendar
            below.
          </p>
          <h1 element="h4">Pick Date</h1>
        </TextContainer>
        <DatePicker
          month={month}
          year={year}
          onChange={setSelectedDates}
          onMonthChange={handleMonthChange}
          disableDatesAfter={new Date()}
          selected={selectedDates}
        />
        <br></br>
        <Button
          disabled={!orderId}
          onClick={() => submitDate()}
          variant="primary"
          fullWidth={true}
        >
          {orderId ? "Submit" : "Pick an Order"}
        </Button>
        {toastMarkup}
      </LegacyCard>
    </Frame>
  );
}
