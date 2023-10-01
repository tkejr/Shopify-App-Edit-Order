import {
  IndexTable,
  Card,
  Button,
  useIndexResourceState,
  Filters,
  Select,
  TextField,
  Modal,
  DatePicker,
  Page,
  ButtonGroup,
} from "@shopify/polaris";
import { useAppQuery } from "../hooks";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { Spinner } from "@shopify/polaris";

export default function InvoiceModal() {
  const [active, setActive] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const fetch = useAuthenticatedFetch();

  const handleChange = useCallback(() => setActive(!active), [active]);

  const handleSendInvoice = async () => {
    // Here, make a POST request to your server with the form data
    try {
      const response = await fetch("/api/sendInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: {
            to: emailTo,
            from: emailFrom,
            subject,
            customMessage,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Handle success scenario
        console.log(data);
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Button onClick={handleChange}>Send Invoice</Button>
      <Modal
        open={active}
        onClose={handleChange}
        title="Send Invoice"
        primaryAction={{
          content: "Send",
          onAction: handleSendInvoice,
        }}
      >
        <Modal.Section>
          <TextField
            value={emailTo}
            onChange={setEmailTo}
            label="To"
            type="email"
          />
          <TextField
            value={emailFrom}
            onChange={setEmailFrom}
            label="From (Should be Verified)"
            type="email"
          />
          <TextField value={subject} onChange={setSubject} label="Subject" />
          <TextField
            value={customMessage}
            onChange={setCustomMessage}
            label="Custom Message"
            multiline={4}
          />
        </Modal.Section>
      </Modal>
    </div>
  );
}
