import React, { useState, useCallback, useEffect } from "react";
import {
  LegacyCard,
  EmptyState,
  Page,
  CalloutCard,
  Badge,
  TextField,
  Button,
  Toast,
  Frame,
  Select,
  BlockStack,
  ButtonGroup,
  Card,
  InlineStack,
  List,
  Text,
  InlineGrid,
} from "@shopify/polaris";
import { customer_portal } from "../assets";
import { cust3 } from "../assets";
import { useAuthenticatedFetch } from "../hooks";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "@shopify/app-bridge-react";
import ErrorBanner from "../components/ErrorBanner";
//import CustomSkeletonPage from "../components/SkeletonPage";

export default function CustomerPortal() {
  const fetch = useAuthenticatedFetch();
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const handleToggle = useCallback(() => setEnabled((enabled) => !enabled), []);
  const badgeStatus = enabled ? "success" : undefined;
  const badgeContent = enabled ? "On" : "Off";
  const contentStatus = enabled ? "Turn off" : "Turn on";
  const [selected, setSelected] = useState("15min");
  const [preferences, setPreferences] = useState([]);
  const [toastContent, setToastContent] = useState("");
  const [isError, setIsError] = useState(false);
  const [statusUrl, setStatusUrl] = useState("");
  const [dynamicLink, setDynamicLink] = useState("");
  const [error, setError] = useState(false);
  //new
  const [loading, setLoading] = useState(false);
  const [userStateLoading, setUserStateLoading] = useState(true);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleSelectChange = useCallback((value) => setSelected(value), []);

  const handleError = () => {
    setError(!error);
  };

  function timeStringToSeconds(timeString) {
    const regex = /^(\d+)\s*([a-zA-Z]+)$/;
    const match = timeString.match(regex);

    if (!match) {
      throw new Error("Invalid time string format");
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case "min":
      case "minute":
        return value * 60;

      case "hr":
      case "hour":
        return value * 3600;

      case "day":
        return value * 86400;

      default:
        throw new Error("Invalid time unit");
    }
  }
  function secondsToTimeString(seconds) {
    if (seconds < 0) {
      throw new Error("Seconds must be non-negative");
    }

    if (seconds < 3600) {
      // less than 1 hour
      const minutes = Math.round(seconds / 60);
      return `${minutes}min`;
    } else if (seconds < 86400) {
      // less than 1 day
      const hours = Math.round(seconds / 3600);
      return `${hours}hr`;
    } else {
      const days = Math.round(seconds / 86400);
      return `${days}day`;
    }
  }
  const options = [
    { label: "15 Minutes", value: "15min" },
    { label: "30 Minutes", value: "30min" },
    { label: "1 Hour", value: "1hr" },
    { label: "3 Hours", value: "3hr" },
    { label: "6 Hours", value: "6hr" },
    { label: "12 Hours", value: "12hr" },
    { label: "1 Day", value: "1day" },
    { label: "3 Days", value: "3day" },
    { label: "7 Days", value: "7day" },
    { label: "30 Days", value: "30day" },
  ];

  //api functions
  const updatePreference = async (requestBody) => {
    // setLoading(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        //const data = await response.json();
        if (requestBody.time_to_edit == undefined) {
          setToastContent(enabled ? "Portal Turned Off" : "Portal Turned On");
          toggleActive();
          handleToggle();
        } else {
          setToastContent("Updated Successfully");
          toggleActive();
        }
      } else {
        setToastContent("Some Problem Occurred With API");
        handleError();
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      setToastContent("Some Problem Occurred With API");
      handleError();
    }
    // setLoading(false);
  };

  const getOrder = async () => {
    //if already saved no need to make a backend request again
    if (statusUrl) {
      window.open(statusUrl, "_blank");
      return;
    }
    try {
      const response = await fetch("/api/viewLast", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // You can include any request body data here if needed
      });
      if (response.ok) {
        const data = await response.json();
        setIsError(false);
        setToastContent("Latest Order Fetched");
        toggleActive();
        setStatusUrl(data.data.data[0].order_status_url);
        window.open(data.data.data[0].order_status_url, "_blank");
      } else {
        setToastContent("Some Problem Occurred With API");
        handleError();
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setToastContent("Some Problem Occurred With API" + response);
      handleError();
    }
  };

  const toastMarkup = active ? (
    <Toast content={toastContent} error={isError} onDismiss={toggleActive} />
  ) : null;

  const settingStatusMarkup = (
    <Badge
      tone={badgeStatus}
      statusAndProgressLabelOverride={`Setting is ${badgeContent}`}
    >
      {badgeContent}
    </Badge>
  );

  useEffect(() => {
    const getPreferences = async () => {
      try {
        const response = await fetch("/api/preferences", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSelected(secondsToTimeString(data.time_to_edit));
          var shopParam = data.shop;
          var subdomain = shopParam.split(".")[0];
          setDynamicLink(
            `https://admin.shopify.com/store/${subdomain}/settings/checkout#orderstatus`
          );
          console.log(dynamicLink);
          setPreferences(data);
          setEnabled(data.enable);
        } else {
          // Handle non-successful response (e.g., show an error message)
          const errorMessage = await response.text(); // Get the error message from the response
          setToastContent(`Some Problem Occurred With API: ${errorMessage}`);
          handleError();
        }
      } catch (error) {
        console.error("Error updating preference:", error);
        setToastContent(`Some Problem Occurred With API: ${error}`);
        handleError();
      }
    };

    getPreferences();
  }, [enabled]);

  //payment stuff
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isPremiumUser = useSelector((state) => state.isPremiumUser);

  const planName = useSelector((state) => state.planName);

  const fetchRecurringCharges = async () => {
    const res = await fetch("/api/check")
      .then((response) => response.json())
      .then((data) => {
        if (data.hasPayment === "pro") {
          dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
          dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
        } else if (data.hasPayment === "starter") {
          dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
          dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
        } else if (data.hasPayment === "starterAnnual") {
          dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
          dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
        } else if (data.hasPayment === "proAnnual") {
          dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
          dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
        } else {
          dispatch({ type: "SET_IS_PREMIUM_USER", payload: false });
        }

        setUserStateLoading(false);
      });
  };

  useEffect(() => {
    fetchRecurringCharges().catch((error) => {
      setToastContent("Some Problem Occurred With API" + response);
      handleError();
      console.error(error);
    });
    //new
    dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
    dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
    //dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
  }, []);
  const nonPremiumUserContent = () => {
    return (
      <Page title="Customer Portal" defaultWidth>
        <Card roundedAbove="sm">
          <BlockStack gap="100">
            <InlineGrid columns={["twoThirds", "oneThird"]}>
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Discover how the Customer Portal can help you
                </Text>
                <Text as="h3" variant="headingSm" fontWeight="medium">
                  How it can help you and your customers
                </Text>
                <List>
                  <List.Item>
                    Reduce returns by <b>57%</b>
                  </List.Item>
                  <List.Item>
                    <b>67%</b> of the customers like self serve portal
                  </List.Item>
                  <List.Item>
                    <b>93%</b> less emails for order changes and cancellations
                  </List.Item>
                  <List.Item>
                    Increase customer retention by <b>45% </b>with self serve
                    portal and increase customer satisfaction
                  </List.Item>
                </List>
              </BlockStack>
              <div
                style={{
                  paddingLeft: "100px",
                }}
              >
                <img
                  src={customer_portal}
                  alt="Customer Portal"
                  width="200px"
                />
              </div>
            </InlineGrid>
            <InlineStack>
              <ButtonGroup>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate("/Plans");
                  }}
                  accessibilityLabel="Edit shipment"
                >
                  Go To Plans
                </Button>
              </ButtonGroup>
            </InlineStack>
          </BlockStack>
        </Card>
      </Page>
    );
  };
  //new
  const preferenceText = loading ? "Loading..." : "Save";
  return (
    <Frame>
      {(planName === "pro" || planName === "proAnnual") && isPremiumUser ? (
        <Page
          //backAction={{ content: "Products", url: "#" }}
          title="Customer Portal"
          titleMetadata={settingStatusMarkup}
          primaryAction={{
            content: contentStatus,
            onAction: () => {
              updatePreference({
                enable: !enabled,
              });
            },
          }}
        >
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="100">
                <Text as="h2" variant="headingSm">
                  About
                </Text>
                <Text>
                  Allow Customers to manage and edit their orders through their
                  customer order status page. To use Order Editor's Customer
                  Portal, you must have customer accounts enabled for your
                  store.
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <Text as="h2" variant="headingSm">
                Install Customer Portal
              </Text>
              <h1>
                Click on View Order to see the checkout page and see the
                customer portal box embedded onto that page
              </h1>
              <br></br>
              <img
                style={{
                  width: "80vw", // This makes the image take up to 80% of the viewport width
                  maxWidth: "50%", // This ensures the image never exceeds the size of its container
                }} // Set the width using inline styles
                src={cust3} // Make sure cust1 contains a valid image URL
                alt="Customer Image"
              />{" "}
              <br></br>
              <br></br>
              <Button onClick={getOrder} variant="primary" disabled={!enabled}>
                View Customer Portal
              </Button>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Determine the time frame for customers to modify orders
                </Text>

                <Select
                  options={options}
                  onChange={handleSelectChange}
                  value={selected}
                />
                <InlineStack align="end">
                  <ButtonGroup>
                    <Button
                      variant="primary"
                      onClick={() => {
                        updatePreference({
                          time_to_edit: timeStringToSeconds(selected),
                        });
                      }}
                      accessibilityLabel="Edit shipment"
                    >
                      {preferenceText}
                    </Button>
                  </ButtonGroup>
                </InlineStack>
              </BlockStack>
            </Card>
            <ErrorBanner
              open={error}
              onClose={handleError}
              content={toastContent}
              buttonText="Contact Support"
              buttonAction={() => {
                navigate("/Help");
              }}
            />
            {toastMarkup}
          </BlockStack>
        </Page>
      ) : (
        nonPremiumUserContent()
      )}
    </Frame>
  );
}
