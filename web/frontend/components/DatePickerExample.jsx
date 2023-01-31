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
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useAuthenticatedFetch } from "../hooks";
export function DatePickerExample(props) {
  const emptyToastProps = { content: null };
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);

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
    start: new Date(),
    end: new Date(),
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
    updateOrder(props.orderId, ConvertDate(selectedDates.start));
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
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error updating the date",
        error: true,
      });
    }
  };

  return (
    <Frame>
      <Page>{toastMarkup}</Page>
      <Card
        title={`Edit Date for ${props.orderName}`}
        sectioned
        primaryFooterAction={{
          content: "Submit",
          onAction: submitDate,
        }}
      >
        <TextContainer spacing="loose">
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
      </Card>
    </Frame>
  );
}
