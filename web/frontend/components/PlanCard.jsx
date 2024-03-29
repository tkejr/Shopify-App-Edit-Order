import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextContainer,
  Banner,
  Button,
  Link,
  Icon,
  BlockStack,
} from "@shopify/polaris";
import { CheckCircleIcon, MinusCircleIcon } from "@shopify/polaris-icons";
function PlanCard({ features, price, planName, upgrade, newPrice }) {
  return (
    <BlockStack align="center">
      <div style={styles.header}>
        <div style={styles.planName}>{planName}</div>
        {planName === "Starter Annual Plan" ||
        planName === "Pro Annual Plan" ? (
          <div style={styles.price}>
            <s>{price}</s> {newPrice}
          </div>
        ) : (
          <div style={styles.price}> {price} </div>
        )}
      </div>
      {features.map((feature, index) => (
        <BlockStack key={index}>
          <div style={{ display: "flex", marginBottom: "10px" }}>
            {(planName === "Starter Plan" ||
              planName === "Starter Annual Plan") &&
            index > 2 ? (
              <BlockStack inlineAlign="end">
                <Icon source={MinusCircleIcon} tone="critical" backdrop />
              </BlockStack>
            ) : (
              <div style={{ float: "right" }}>
                <Icon source={CheckCircleIcon} tone="success" backdrop />
              </div>
            )}
            <div style={{ float: "right" }}>
              <p>{feature} </p>
            </div>
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
