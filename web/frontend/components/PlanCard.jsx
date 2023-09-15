import React, { useState, useEffect, useCallback } from "react";
import { Modal, TextContainer, Banner, Button, Link, Icon, Card, Stack} from "@shopify/polaris";
import {
  
    CircleTickMajor,
    CircleCancelMajor,
  } from "@shopify/polaris-icons";
function PlanCard({ features, price, planName, upgrade }) {
  
  
  return (
    
        <Stack vertical spacing="loose">
          <div style={styles.header}>
            <div style={styles.price}>${price}</div>
            <div style={styles.planName}>{planName}</div>
          </div>
          {features.map((feature, index) => (
              <Card.Section>
              <div style={{ display: "flex", alignItems: "center" }}>
              <Icon source={CircleTickMajor} color="success" backdrop />
                <div style={{ marginLeft: "10px" }}>
                  <p>
                    {feature}{" "}
                    
                    
                  </p>
                </div>
              </div>
            </Card.Section>
            ))}
            {(planName==='Starter Plan') && <div style={{padding:"123px"}}></div>}
          
                 { /*<div style={styles.buttonContainer}>
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
    },
    price: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      color: '#333',
    },
    planName: {
      fontSize: '1.2em',
      color: '#555',
    },
    buttonContainer: {
      marginTop: '20px',
      textAlign: 'center',
    },
  };
