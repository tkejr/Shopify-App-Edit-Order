import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextContainer,
  Banner,
  Button,
  LegacyCard,
  Layout,
  FormLayout,
  TextField,
  ButtonGroup
} from "@shopify/polaris";

import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../../hooks";

const AdvancedEditingPanel = (props)  =>{
  const fetch = useAuthenticatedFetch()
  const orderId = useSelector((state) => state.orderId);
  const [status, setStatus] = useState("");
  const [updateButton, setUpdateButton] = useState("Update");
  const [errorContent, setErrorContent] = useState("");
  const [modalError, setModalError] = useState(false);
  //type
  const [selected, setSelected] = useState('');
    const handleSelectChange = useCallback((value) => setSelected(value),[],);
    const options = [
    {label: 'Percentage', value: 'percentage'},
    {label: 'Fixed Amount', value: 'fixed_amount'},
    ];
    //
  const addShipping = () => {
    props.setShippingCostDetails([{ title: "", price: "" }]);
    //props.setShowSave(true)
  };
  const addDiscount = () => {
    props.setDiscounts([{ code: "", amount: "" , type: ""}]);
    //props.setShowSave(true)
  };
  const addTaxes = () => {
    props.setTaxes([{ price: "", rate: "" , title: ""}]);
    //props.setShowSave(true)
  };
  const shippingLines = props.shippingCostDetails?.map((shippingDetail, index) => (
    <FormLayout.Group>
      <TextField
        type="text"
        label="Title"
        value={shippingDetail.title || ""}
        onChange={(value) => {props.handleShippingLines("title", value, index); props.setShowSave(true);}}
      />
      <TextField
        type="text"
        label="Price"
        error= {shippingDetail.price<0 && "Cannot be below 0"}
        value={shippingDetail.price || ""}
        onChange={(value) => {props.handleShippingLines("price", value, index);props.setShowSave(true)}}
      />
    </FormLayout.Group>
  ))
  const discountLines = props.discounts?.map((discount, index) => (
   
    <FormLayout.Group>
     
     
      <TextField
        type="text"
        label="Name"
        value={discount.code || ""}
        onChange={(value) => {props.handleDiscounts("code", value, index); props.setShowSave(true);props.setDiscountsChanged(true)}}
      />
      <TextField
        type="text"
        label="Amount"
        value={discount.amount || ""}
        onChange={(value) => {props.handleDiscounts("amount", value, index);props.setShowSave(true);props.setDiscountsChanged(true)}}
      />
      <ButtonGroup variant="segmented">
      <Button pressed={discount.type === "percentage"} onClick={()=> {props.handleDiscounts("type", "percentage", index);props.setShowSave(true);props.setDiscountsChanged(true)}} > Percentage </Button>
      <Button pressed={discount.type === "fixed_amount"} onClick={()=> {props.handleDiscounts("type", "fixed_amount", index);props.setShowSave(true);props.setDiscountsChanged(true)}}>Fixed amount</Button>
    </ButtonGroup>
    </FormLayout.Group>
  ))

  const taxLines = props.taxes?.map((tax, index) => (
   
    <FormLayout.Group>
     <TextField
        type="text"
        label="Price"
        disabled={true}
        value={tax.price || ""}
        onChange={(value) => {props.handleTaxes("price", value, index); props.setShowSave(true);props.setDiscountsChanged(true)}}
      />
      <TextField
        type="text"
        label="Tax Rate"
        error= {tax.rate<0 && "Cannot be below 0"}
        value={tax.rate || ""}
        onChange={(value) => {props.handleTaxes("rate", value, index);props.setShowSave(true);props.handleTaxesChanged(true)}}
      />
      <TextField
        type="text"
        disabled={true}
        label="Title"
        
        value={tax.title || ""}
        onChange={(value) => {props.handleTitle("title", value, index);props.setShowSave(true);props.setDiscountsChanged(true)}}
      />
    </FormLayout.Group>
  ))
  return (
    <LegacyCard title="Order Details" sectioned>
        <LegacyCard.Section title="Shipping Cost">
        <FormLayout>
              {props.shippingCostDetails == false ? (
                <Button onClick={() => addShipping()}>Add Shipping</Button>
              ) : (
                <>{shippingLines}</>
              )}
             
            </FormLayout>
        </LegacyCard.Section>
          <LegacyCard.Section title="Discounts">
          <FormLayout>
              {props.discounts == false ? (
                <Button onClick={() => addDiscount()}>Add Discount</Button>
              ) : (
                <>{discountLines}</>
              )}
              
            </FormLayout>
        </LegacyCard.Section>
        <LegacyCard.Section title="Tax Lines">
          <FormLayout>
              {props.taxes == false ? (
                <Button onClick={() => addTaxes()}>Add Tax Lines</Button>
              ) : (
                <>{taxLines}</>
              )}
              
            </FormLayout>
        </LegacyCard.Section>
       
          </LegacyCard>
  );
}

export default AdvancedEditingPanel;