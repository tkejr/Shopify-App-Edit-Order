import {
  DatePicker,
  TextContainer,
  DisplayText,
  Heading,
  TextStyle,
  Card,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

export function DatePickerExample(props) {
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
