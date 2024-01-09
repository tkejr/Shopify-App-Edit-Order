import {
  IndexTable,
  LegacyCard,
  Button,
  useIndexResourceState,
  Filters,
  Select,
  TextField,
  Modal,
  Banner
} from "@shopify/polaris";
import { useAppQuery } from "../hooks";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { Spinner } from "@shopify/polaris";
import { useSelector, useDispatch } from "react-redux";

const InvoiceModal = (props) => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [emailTo, setEmailTo] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const fetch = useAuthenticatedFetch();
  const orderId = useSelector((state) => state.orderId);
  const handleChange = useCallback(() => setActive(!active), [active]);
/*
  const getOrderEmail = async () => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      //body: JSON.stringify({ date: newDate }),
    };
    fetch(`/api/orderBilling/email/${orderId}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setEmailTo(data.email);
      });
  };
  useEffect(async () => {
    if(orderId){
      getOrderEmail();
    }
    
  }, [orderId]);
*/
  const handleSendInvoice = async () => {
    // Here, make a POST request to your server with the form data
    setLoading(true)
    try {
      const response = await fetch("/api/sendInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: {
            to: props.emailTo,
            from: emailFrom,
            subject,
            customMessage,
          },
          orderId: orderId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Handle success scenario
        console.log(data);
        props.setToastProps({ content: "Invoice sent" });
      } else {
        // Handle errors
        props.setErrorContent(
          "There was an error sending the invoice, double check that everything is correct "
        );
        props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
        props.handleError();
      }
    } catch (error) {
      props.setErrorContent(
        "There was an error sending the invoice, double check that everything is correct "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }
    //setEmailTo("");
    setLoading(false); 
    setEmailFrom("");
    setSubject("");
    setCustomMessage("");
    props.handleInvoiceModal();
  };

  return (
    <div>
     
      <Modal
        open={props.openInvoice}
        onClose={props.handleInvoiceModal}
        title="Send Invoice"
        primaryAction={{
          content: (loading) ? "Loading..." : "Save",
          onAction: handleSendInvoice,
        }}
      >
        <Modal.Section>
          <TextField
            value={props.emailTo}
            onChange={props.setEmailTo}
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

        { props.emailTo === "" &&
        <Modal.Section>
        <Banner tone="warning">
            <p>
              Make sure there is a customer to this order before sending an invoice{' '}
         
            </p>
        </Banner>
      </Modal.Section>
}
      </Modal>
    </div>
  );
}

export default InvoiceModal; 