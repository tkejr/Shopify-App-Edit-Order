

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextContainer,
  Banner,
  Button,
  Link,
  Icon,
  
  BlockStack
} from "@shopify/polaris";
import { CircleTickMajor, CircleCancelMajor } from "@shopify/polaris-icons";
function PlanCard({ features, price, planName, upgrade, newPrice }) {
  return (
    <BlockStack align="center">
      <div style={styles.header}>
        <div style={styles.planName}>{planName}</div>
        <div style={styles.price}>{price}</div>
      </div>
      {features.map((feature, index) => (
        <BlockStack >
          <div style={{ display: "flex", marginBottom:'10px' }}>
          <div style={{  float:'left' }}>
              <p>{feature} </p>
            </div>
            {planName === "Starter Plan" && index > 2 ? (
              <BlockStack inlineAlign="end">
              <Icon source={CircleCancelMajor} tone="critical" backdrop />
              </BlockStack>
            ) : (
              <div style={{float:'right'}}>
              <Icon source={CircleTickMajor} tone="success" backdrop />
              </div>
            )}

           
          </div>
        </BlockStack>
      ))}

      {/*<div style={styles.buttonContainer}>
                  <Button primary onClick={()=>upgrade()}>
              Get the {planName}
            </Button>
            </div>
          */}
    </BlockStack>
  );
}

export default PlanCard;

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ccc",
    paddingBottom: "10px",
  },
  price: {
    fontSize: "1.5em",

    color: "#333",
  },
  planName: {
    fontSize: "1.2em",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: "20px",
    textAlign: "center",
  },
};
