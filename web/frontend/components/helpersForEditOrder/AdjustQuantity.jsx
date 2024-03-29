import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  InlineError,
  Banner,
  Button,  
  TextField
} from "@shopify/polaris";

import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../../hooks";
import { useNavigate } from "@shopify/app-bridge-react";
const AdjustQuantity = (props)  =>{
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const orderId = useSelector((state) => state.orderId);
  const [status, setStatus] = useState("");
  const [updateButton, setUpdateButton] = useState("Update");
  const [errorContent, setErrorContent] = useState("");
  const [modalError, setModalError] = useState(false);
  //const [inlineError, setInlineError] = useState(false);
  //const [quantity, setQuantity] = useState();
 // const [originalQuantity, setOriginalQuantity] = useState(props.originalQuantity)
 
  const handleModalError = () => {
    setModalError(!modalError);
  };
  const handleInlineError = () => {
    props.setInlineError(!props.inlineError);
  };
  const handleQuantityChange = (number) => {
    props.setInlineError(false)
    if (number < 0) {
      setErrorContent("When adjusting the quantity, the quantity must be at least 1."); 
      handleInlineError();
    } else {
      props.setQuantity("" + number);
    }
    };
    useEffect(() => {
        
        setErrorContent("")
        setModalError(false)
        props.setInlineError(false); 
      }, []);
    const changeAmount = async () => {
       setUpdateButton("Loading...")
        if (props.quantity === props.originalQuantity) {
          setErrorContent(
            `Please select a quantity that is different from the original quantity: ${props.originalQuantity}.  
             \n \n If the error persists please contact support: `
          );
          handleModalError();
          setUpdateButton("Update")
        } else if (props.originalQuantity === "0") {
          setErrorContent(
            "Cannot change the quantity of a product that was originally zero. To learn more, contact support: "
          );
          handleModalError();
          setUpdateButton("Update")
        } else {
          setStatus("loading");
          const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          };
          const response = await fetch(
            "/api/changeAmount/" + orderId + "/" + props.lineItemId + "/" + props.quantity,
            requestOptions
          );
          if (response.ok) {
            props.setToastProps({ content: "Quantity updated" });
            //props.setReloadComp(!props.reloadComp);
          } else {
            props.setErrorContent(
              "There was an error updating the quantity. Make sure the line item is not fulfilled. If the error persists, contact support:  "
            );
            //props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
            props.handleError();
          }
          setUpdateButton("Update")
          props.handleChangeQuantity();
          props.setReload(!props.reload);
          setStatus("success");
        }
      };
    
  return (
    <Modal
    open={props.activeQuantity}
    onClose={props.handleChangeQuantity}
    title="Adjust Quantity"
    primaryAction={{
      content: updateButton,
      onAction: () => changeAmount(),
    }}
  >
    {modalError && (
      <div style={{ padding: "10px" }}>
        <Banner
          title="Error"
          onDismiss={() => handleModalError()}
          tone="critical"
        >
          <p>{errorContent}</p>
          <Button onClick={() => navigate("/Help")}>Contact Support</Button>
        </Banner>
      </div>
    )}

    <Modal.Section>

      <TextField
        label="Quantity"
        type="number"
        value={props.quantity}
        onChange={(number) => handleQuantityChange(number)}
        error={props.quantity < 0}
        autoComplete="off"
      />
      <br></br>
       { props.inlineError && <InlineError message={"Quantity must be at least 1"} fieldID="inLineError" />}
    </Modal.Section>
  </Modal>
  );
}

export default AdjustQuantity;