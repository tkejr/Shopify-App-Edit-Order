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
import { useNavigate } from "@shopify/app-bridge-react";

const UpdateBillingAddress = (props)  =>{
  

const fetch = useAuthenticatedFetch();
const navigate = useNavigate();
const orderId = useSelector((state) => state.orderId);
const [updateButton, setUpdateButton] = useState("Update");
  //you can have addShippingAddy here
  const addBillingAddress = () => {
    props.setBillingDetails({
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
  const updateOrderBilling = async () => {
    setUpdateButton("Loading...");
    try {
      const response = await fetch(`/api/orderBilling/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(props.billingDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to update billing details");
      }
      props.setToastProps({ content: "Billing details updated successfully" });
    } catch (error) {
      
      props.setErrorContent(
        "There was an error updating the billing details to the order. See the reasons why that may be the case here: "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
      
    }
    setUpdateButton("Update");
    //props.setReloadComp(!props.reloadComp);
    //props.handleChangeShipping();//
    //navigate back to edit order
    navigate("/EditOrder")
  };
  
  return (
    <Modal
    open={props.activeBilling}
    onClose={props.handleChangeBilling}
    title="Order Billing Address"
    primaryAction={{
      content: updateButton,
      onAction: updateOrderBilling,
    }}
  >
    
    
      <Modal.Section>
        <FormLayout>
          {props.billingDetails?.status === 'none' ? (<Button onClick={()=> addBillingAddress()}> Add Billing Address</Button>) : (
            <>
          <FormLayout.Group>

            <TextField
              type="text"
              label="Address 1"
              value={props.billingDetails?.address1}
              onChange={(value) =>
                props.handleFieldChangeBilling("address1", value)
              }
            />
            <TextField
              type="text"
              label="Address 2"
              value={props.billingDetails?.address2 || ""}
              onChange={(value) =>
                props.handleFieldChangeBilling("address2", value)
              }
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="text"
              label="City"
              value={props.billingDetails?.city}
              onChange={(value) => props.handleFieldChangeBilling("city", value)}
            />
            <TextField
              type="text"
              label="Country"
              value={props.billingDetails?.country}
              onChange={(value) =>
                props.handleFieldChangeBilling("country", value)
              }
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="text"
              label="First Name"
              value={props.billingDetails?.first_name || ""}
              onChange={(value) =>
                props.handleFieldChangeBilling("first_name", value)
              }
            />
            <TextField
              type="text"
              label="Last Name"
              value={props.billingDetails?.last_name}
              onChange={(value) =>
                props.handleFieldChangeBilling("last_name", value)
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
              value={props.billingDetails?.phone || ""}
              onChange={(value) =>
                props.handleFieldChangeBilling("phone", value)
              }
            />
            <TextField
              type="text"
              label="Province"
              value={props.billingDetails?.province}
              onChange={(value) =>
                props.handleFieldChangeBilling("province", value)
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
              value={props.billingDetails?.zip}
              onChange={(value) => props.handleFieldChangeBilling("zip", value)}
            />
          </FormLayout.Group>
          </>
          )}
        </FormLayout>

        <br></br>
        <Banner onDismiss={() => {}}>
          <p>
            Clicking the Update button will update the Billing address and then send you back to the Edit Order page
          </p>
        </Banner>
      </Modal.Section>
    
  </Modal>
  );
}

export default UpdateBillingAddress;