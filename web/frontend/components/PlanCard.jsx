import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextContainer,
  Banner,
  Button,
  Link,
  Icon,
  Card,
  Stack,
} from "@shopify/polaris";
import { CircleTickMajor, CircleCancelMajor } from "@shopify/polaris-icons";
function PlanCard({ features, price, planName, upgrade }) {
  return (
    <Stack vertical spacing="loose">
      <div style={styles.header}>
        <div style={styles.planName}>{planName}</div>
        <div style={styles.price}>${price}</div>
      </div>
      {features.map((feature, index) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {planName === "Starter Plan" && index > 2 ? (
              <Icon source={CircleCancelMajor} color="critical" backdrop />
            ) : (
              <Icon source={CircleTickMajor} color="success" backdrop />
            )}

            <div style={{ marginLeft: "10px" }}>
              <p>{feature} </p>
            </div>
          </div>
        </div>
      ))}

      {/*<div style={styles.buttonContainer}>
                  <Button primary onClick={()=>upgrade()}>
              Get the {planName}
            </Button>
            </div>
          */}
    </Stack>
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
