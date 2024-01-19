import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  
  Banner,
  
  TextField
} from "@shopify/polaris";

import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../../hooks";

const AddLineItemDiscount = (props)  =>{
  const fetch = useAuthenticatedFetch()
  const orderId = useSelector((state) => state.orderId);
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [updateButton, setUpdateButton] = useState("Update");
  const [errorContent, setErrorContent] = useState("");
  const [modalError, setModalError] = useState(false);
  //const [quantity, setQuantity] = useState();
 // const [originalQuantity, setOriginalQuantity] = useState(props.originalQuantity);
  const handleModalError = () => {
    setModalError(!modalError);
  };
  
  const handleAmount= (number) => {
    //console.log(number)
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
   const addLineItemDiscount = async () => {
    setUpdateButton("Loading...");
    
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    const response = await fetch(
      "/api/addLineItemDiscount/" + orderId + "/" + props.lineItemId + "/" + amount + "/" + description + "/"+ props.currencyCode,
      requestOptions
    );
    if (response.ok) {
      props.setToastProps({ content: "Order updated" });
      setAmount("");
      setDescription("");
      
    } else {
      props.setErrorContent(
        "There was an error adding the line item discount. Contact Support: "
      );
      //props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }
    setUpdateButton("Update")
    props.handleChangeAddLineItemDiscounts();
    props.setReload(!props.reload);
    setStatus("success");
  };
    
  return (
    <Modal
    open={props.activeLineItemDiscounts}
    onClose={props.handleChangeAddLineItemDiscounts}
    title="Add Discount"
    primaryAction={{
      content: updateButton,
      onAction: () => addLineItemDiscount(),
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
        label="Amount"
        type="text"
        value={amount}
        onChange={(number) => handleAmount(number)}
        //error={parseInt(amount) < 0}
        autoComplete="off"
      />
       <TextField
        label="Description of discount"
        type="text"
        value={description}
        onChange={(text) => setDescription(text)}
        //error={props.quantity < 0}
        autoComplete="off"
      />
    </Modal.Section>
    <Modal.Section>
        <Banner
          title="Important"
          //onDismiss={}
          tone="warning"
        >
          <p>This can only be done on unpaid components of an order. Also, this cannot be done more than once on the same line item.
             If you make a mistake, then the only way to get rid of the discount is to add the product again and remove the old one. If you cannot add a new product, add a Custom Item</p>
        </Banner>
    </Modal.Section>
   
  </Modal>
  );
}

export default AddLineItemDiscount;