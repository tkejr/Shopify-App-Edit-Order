import {
  DatePicker,
  TextContainer,
  DisplayText,
  Heading,
  TextStyle,
  Card,
  Toast,
  Frame,
  Page,
  Button,
  Banner,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { useSelector, useDispatch } from "react-redux";
import ErrorBanner from "../components/ErrorBanner";

export function DatePickerExample(props) {
  const emptyToastProps = { content: null };
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);

  const [error, setError] = useState(false);
  ////new code
  const orderId = useSelector((state) => state.orderId);
  const orderName = useSelector((state) => state.orderName);
  const dispatch = useDispatch();

  const handleError = () => {
    setError(!error);
  };
  var title = "Please  Click on Order Number";
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
    start: new Date("January 17, 2023 03:24:00"),
    end: new Date("January 17, 2023 03:24:00"),
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const ConvertDate = (date) => {
    const convertedDate = new Date(date).toISOString();
    return convertedDate;
  };

  const submitDate = () => {
    let defaultDate = new Date("Jan 17 2023");

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
    updateOrder(props.orderId, ConvertDate(selectedDates.start));
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

      props.setErrorContent(
        "There was an error updating the date. See the reasons why that may be the case here: "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }
  };

  return (
    <Frame>
      <Card title={title} sectioned>
        <TextContainer spacing="loose" id="section-1">
          <p>
            You can Backdate an order by selecting a date from the calendar
            below.
          </p>
          <Heading element="h4">Pick Date</Heading>
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
          primary={orderId}
          fullWidth={true}
        >
          {orderId ? "Submit" : "Pick an Order"}
        </Button>
        {toastMarkup}
      </Card>
    </Frame>
  );
}
