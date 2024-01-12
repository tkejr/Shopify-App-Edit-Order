import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextContainer,
  Banner,
  Button,
  TextField,
  FormLayout
} from "@shopify/polaris";
import { CircleTickMajor, CircleCancelMajor } from "@shopify/polaris-icons";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../../hooks";

const UpdateShippingAddress = (props)  =>{
  
    //props
  //activeShipping
  //handleChangeShipping
//shippingDetails
//handleFieldChangeShipping
//setShippingDetails
//error stuff
const fetch = useAuthenticatedFetch()
const orderId = useSelector((state) => state.orderId);
const [updateButton, setUpdateButton] = useState("Update");
  //you can have addShippingAddy here
  const addShippingAddress = () => {
    props.setShippingDetails({
      first_name: '', 
      last_name:'', 
      address1: '', 
      address2: '', 
      phone: '', 
      province:'',
      city: '',
      zip: '',

       });
  };
  const updateOrderShipping = async () => {
    setUpdateButton("Loading...");
    try {
      const response = await fetch(`/api/orderBilling/shipping/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(props.shippingDetails),
      });

      if (!response.ok) {
        props.setErrorContent(
          "There was an error updating the shipping details to the order. Make sure it is a correct shipping address. If the error persists, contact support: "
        );
        //props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
        props.handleError();
        props.handleChangeShipping();
        setUpdateButton("Update");
      }
      else{
        props.setToastProps({ content: "Details updated successfully" });
        setUpdateButton("Update");
        //props.setReloadComp(!props.reloadComp);
        props.handleChangeShipping();
      }

      
    } catch (error) {
      
      props.setErrorContent(
        "There was an error updating the shipping details to the order. Make sure it is a correct shipping address. If the error persists, contact support: "
      );
      //props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }
   
  };
  return (
    <Modal
    open={props.activeShipping}
    onClose={props.handleChangeShipping}
    title="Order Shipping Address"
    primaryAction={{
      content: updateButton,
      onAction: updateOrderShipping,
    }}
  >
    
      <Modal.Section>
        <FormLayout>
          {props.shippingDetails?.status === 'none' ? (<Button onClick={()=> addShippingAddress()}> Add Shipping Address</Button>) : (
            <>
          <FormLayout.Group>

            <TextField
              type="text"
              label="Address 1"
              value={props.shippingDetails?.address1}
              onChange={(value) =>
                props.handleFieldChangeShipping("address1", value)
              }
            />
            <TextField
              type="text"
              label="Address 2"
              value={props.shippingDetails?.address2 || ""}
              onChange={(value) =>
                props.handleFieldChangeShipping("address2", value)
              }
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="text"
              label="City"
              value={props.shippingDetails?.city}
              onChange={(value) => props.handleFieldChangeShipping("city", value)}
            />
            <TextField
              type="text"
              label="Country"
              value={props.shippingDetails?.country}
              onChange={(value) =>
                props.handleFieldChangeShipping("country", value)
              }
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="text"
              label="First Name"
              value={props.shippingDetails?.first_name || ""}
              onChange={(value) =>
                props.handleFieldChangeShipping("first_name", value)
              }
            />
            <TextField
              type="text"
              label="Last Name"
              value={props.shippingDetails?.last_name}
              onChange={(value) =>
                props.handleFieldChangeShipping("last_name", value)
              }
            />
          </FormLayout.Group>
          <FormLayout.Group>
            {/* <TextField
            type="text"
            label="Latitude"
            value={billingDetails.latitude || ""}
            onChange={(value) => handleFieldChange("latitude", value)}
          /> */}
          </FormLayout.Group>

          <FormLayout.Group>
            <TextField
              type="text"
              label="Phone"
              value={props.shippingDetails?.phone || ""}
              onChange={(value) =>
                props.handleFieldChangeShipping("phone", value)
              }
            />
            <TextField
              type="text"
              label="Province"
              value={props.shippingDetails?.province}
              onChange={(value) =>
                props.handleFieldChangeShipping("province", value)
              }
            />
          </FormLayout.Group>
          <FormLayout.Group>
            {/* <TextField
            type="text"
            label="Province Code"
            value={billingDetails.province_code}
            onChange={(value) => handleFieldChange("province_code", value)}
          /> */}
            <TextField
              type="text"
              label="ZIP"
              value={props.shippingDetails?.zip}
              onChange={(value) => props.handleFieldChangeShipping("zip", value)}
            />
          </FormLayout.Group>
          </>
          )}
        </FormLayout>
      </Modal.Section>
    
  </Modal>
  );
}

export default UpdateShippingAddress;