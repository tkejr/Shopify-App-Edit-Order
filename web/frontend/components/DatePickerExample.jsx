import {
  DatePicker,
  TextContainer,
  DisplayText,
  Heading,
  TextStyle,
  Card,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useAuthenticatedFetch } from "../hooks";
export function DatePickerExample(props) {
  const fetch = useAuthenticatedFetch();
  const [{ month, year }, setDate] = useState({ month: 1, year: 2018 });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date("Wed Feb 07 2018 00:00:00 GMT-0500 (EST)"),
    end: new Date("Wed Feb 07 2018 00:00:00 GMT-0500 (EST)"),
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );
  const submitDate = () => {
    alert("Submitted");
    // need to not hardcode this
    //updateOrder(5245740286230,'2019-03-13T16:09:54-04:00')
  };
  const updateOrder = async (id, newDate) => {
    //make sure you are passing them in correctly, the date needs to be the correct date format as a string
    const requestOptions = {
      method:'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate })
    }
    // I did the one which has variable id's, not hardcoded, but it probably does not work as is
    const response = await fetch("/api/orders/" + id, requestOptions);
    

    
  };

  return (
    <Card
      title={`Edit Date for #${props.orderId}`}
      sectioned
      primaryFooterAction={{
        content: "Submit",
        onAction: submitDate,
      }}
    >
      <TextContainer spacing="loose">
        <p>
          You can Backdate an order by selecting a date from the calendar below.
        </p>
        <Heading element="h4">Pick Date</Heading>
      </TextContainer>
      <DatePicker
        month={month}
        year={year}
        onChange={setSelectedDates}
        onMonthChange={handleMonthChange}
        selected={selectedDates}
      />
    </Card>
  );
}
