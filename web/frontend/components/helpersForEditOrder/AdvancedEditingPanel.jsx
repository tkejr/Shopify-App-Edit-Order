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
import {
    GaugeMinor
  } from '@shopify/polaris-icons';
import { CircleTickMajor, CircleCancelMajor } from "@shopify/polaris-icons";
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
    props.setShowSave(true)
  };
  const addDiscount = () => {
    props.setDiscounts([{ code: "", amount: "" , type: ""}]);
    props.setShowSave(true)
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
        onChange={(value) => {props.handleDiscounts("code", value, index); props.setShowSave(true);}}
      />
      <TextField
        type="text"
        label="Amount"
        value={discount.amount || ""}
        onChange={(value) => {props.handleDiscounts("amount", value, index);props.setShowSave(true)}}
      />
      <ButtonGroup variant="segmented">
      <Button pressed={discount.type === "percentage"} onClick={()=> props.handleDiscounts("type", "percentage", index)} > Percentage </Button>
      <Button pressed={discount.type === "fixed_amount"} onClick={()=> props.handleDiscounts("type", "fixed_amount", index)}>Fixed amount</Button>
    </ButtonGroup>
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
              {/* <div style={{ padding: "10px" }}>
                <Button
                  plain
                  disclosure={expanded ? "up" : "down"}
                  onClick={() => {
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? "Close" : "Shipping Taxes"}
                </Button>
              </div>
              {expanded && (
                <>
                  <Button onClick={() => addTaxLine()}>Add Tax Line</Button>
                  {taxLinesArray}
                </>
              )} */}
            </FormLayout>
        </LegacyCard.Section>
          <LegacyCard.Section title="Discounts">
          <FormLayout>
              {props.discounts == false ? (
                <Button onClick={() => addDiscount()}>Add Discount</Button>
              ) : (
                <>{discountLines}</>
              )}
              {/* <div style={{ padding: "10px" }}>
                <Button
                  plain
                  disclosure={expanded ? "up" : "down"}
                  onClick={() => {
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? "Close" : "Shipping Taxes"}
                </Button>
              </div>
              {expanded && (
                <>
                  <Button onClick={() => addTaxLine()}>Add Tax Line</Button>
                  {taxLinesArray}
                </>
              )} */}
            </FormLayout>
        </LegacyCard.Section>
       
          </LegacyCard>
  );
}

export default AdvancedEditingPanel;