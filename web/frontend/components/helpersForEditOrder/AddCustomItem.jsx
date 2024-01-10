import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Banner,
  TextField
} from "@shopify/polaris";
import { CircleTickMajor, CircleCancelMajor } from "@shopify/polaris-icons";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../../hooks";

const AddCustomItem = (props)  =>{
  const fetch = useAuthenticatedFetch()
  const orderId = useSelector((state) => state.orderId);
  const [status, setStatus] = useState("");
  const [updateButton, setUpdateButton] = useState("Update");
  const [errorContent, setErrorContent] = useState("");
  const [modalError, setModalError] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  
  const handleModalError = () => {
    setModalError(!modalError);
  };
  const handleAmount= (number) => {
   
    if (parseInt(number) < 0) {
      setErrorContent("Amount must be greater than 0"); 
      handleModalError();
    } else {
      setAmount(number);
    }
    };
    useEffect(() => {
        
        setErrorContent("")
        setModalError(false)
      }, []);
    //big function to add a line item discount
    const addCustomItem = async () => {
        setUpdateButton("Loading...");
        
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        };
        const response = await fetch(
          "/api/addCustomItem/" + orderId + "/" + title + "/" + amount +  "/"+ currencyCode,
          requestOptions
        );
        if (response.ok) {
          props.setToastProps({ content: "Order updated" });
          setAmount("");
          setTitle("");
          setCurrencyCode("");
        } else {
          props.setErrorContent(
            "There was an error adding the custom item to the order. Make sure the currency code is correct. If the error persists, contact support: "
          );
          //props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
          props.handleError();
        }
        setUpdateButton("Update")
        props.handleChangeCustomItem();
        props.setReload(!props.reload);
        setStatus("success");
      };
    
  return (
    <Modal
    open={props.activeCustomItem}
    onClose={props.handleChangeCustomItem}
    title="Add Custom Item"
    primaryAction={{
      content: updateButton,
      onAction: () => addCustomItem(),
    }}
  >
    {modalError && (
      <div style={{ padding: "10px" }}>
        <Banner
          title="Error"
          onDismiss={() => handleModalError()}
          status="critical"
        >
          <p>{errorContent}</p>
        </Banner>
      </div>
    )}

    <Modal.Section>

    <TextField
        label="Title of Item"
        type="text"
        value={title}
        onChange={(text) => setTitle(text)}
        //error={props.quantity < 0}
        autoComplete="off"
      />
    <TextField
        label="Amount"
        type="text"
        value={amount}
        onChange={(number) => handleAmount(number)}
        //error={parseInt(amount) < 0}
        autoComplete="off"
      />
      <TextField
        label="Currency Code"
        type="text"
        value={currencyCode}
        onChange={(code) => setCurrencyCode(code)}
        //error={parseInt(amount) < 0}
        autoComplete="off"
      />
      
    </Modal.Section>
    <Modal.Section>
        <Banner
          title="Important"
          //onDismiss={}
          tone="info"
        >
          <p>Currency code is USD for US dollars.</p>
        </Banner>
    </Modal.Section>
  </Modal>
  );
}

export default AddCustomItem;