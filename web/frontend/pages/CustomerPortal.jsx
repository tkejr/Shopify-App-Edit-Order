import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  EmptyState,
  Page,
  CalloutCard,
  Badge,
  TextField,
  Button,
  Toast,
  Frame,
  Select,
  MediaCard,
  Banner,
  Link,
  Modal,
  TextContainer,
} from "@shopify/polaris";
import { cust1, edit_paywall } from "../assets";
import { cust2 } from "../assets";
import { cust3 } from "../assets";
import { useAuthenticatedFetch } from "../hooks";
import { isError } from "react-query";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "@shopify/app-bridge-react";
import ErrorBanner from "../components/ErrorBanner";
import CustomSkeletonPage from "../components/SkeletonPage";

export default function CustomerPortal() {
  const fetch = useAuthenticatedFetch();
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(true);
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
  const [userStateLoading, setUserStateLoading] = useState(true);
  const [copiedContent, setCopiedContent] =
    useState(`<!-- BEGIN EDIT ORDER CUSTOMER PORTAL ORDER STATUS SNIPPET -->
    {% if customer %}
      {% assign timestamp = 'now' | date: '%s' %} {% assign eo_sig = "t=" | append: timestamp | append: "&oid=" | append: checkout.order_id | append: "&shop=" | append: shop.permanent_domain | hmac_sha256: "ec0617d142ddf3b85e017ae2e3a39744" %}
      <script id="customer-portal_button" src="https://editify-cportal.kejrtech.com/getScript" data-timestamp="{{timestamp}}" data-token={{eo_sig}} data-baseurl="editify-cportal.kejrtech.com" defer></script>
    {% endif %}
    <!-- END EDIT ORDER CUSTOMER PORTAL ORDER STATUS SNIPPET -->`);

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
    handleToggle();

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setIsError(false);
        setToastContent("Updated Successfully");

        toggleActive();
      } else {
        setToastContent("Some Problem Occurred With API");
        handleError();
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      setToastContent("Some Problem Occurred With API" + response);
      handleError();
    }
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
        setToastContent("Order Fetched Successfully");
        setStatusUrl(data.data[0].order_status_url);
        window.open(data.data[0].order_status_url, "_blank");
        toggleActive();
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
  const handleCopyClick = () => {
    // Copy the content to the clipboard
    setToastContent("Copied Successfully");
    handleError();
    navigator.clipboard.writeText(copiedContent);
  };

  const settingStatusMarkup = (
    <Badge
      status={badgeStatus}
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
          setToastContent("Some Problem Occurred With API");
          handleError();
        }
      } catch (error) {
        console.error("Error updating preference:", error);
        setToastContent("Some Problem Occurred With API" + response);
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
  const checkPremiumUserContent = () => {
    return (
      <Page title="Customer Portal" defaultWidth>
        <MediaCard
          title="Discover how the Customer Portal can help you"
          description="Upgrade to Pro to let customers be able to edit orders and reduce returns"
          primaryAction={{
            content: "Go to Plans",
            onAction: () => {
              navigate("/Plans");
            },
          }}
        >
          <img
            alt=""
            width="100%"
            height="100%"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            src={edit_paywall}
          />
        </MediaCard>
      </Page>
    );
  };

  return (
    <Frame>
      {planName === "pro" && isPremiumUser ? (
        userStateLoading ? (
          <CustomSkeletonPage></CustomSkeletonPage>
        ) : (
          <Page
            backAction={{ content: "Products", url: "#" }}
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
            <Card title="About">
              <Card.Section>
                <p>
                  Allow Customers to manage and edit their orders through their
                  customer order status page. To use Order Editor's Customer
                  Portal, you must have customer accounts enabled for your
                  store.
                </p>
                {/* <img
                style={{
                  width: "80vw", // This makes the image take up to 80% of the viewport width
                  maxWidth: "50%", // This ensures the image never exceeds the size of its container
                }}
                src={cust1} // Make sure cust1 contains a valid image URL
                alt="Customer Image"
              />{" "} */}
              </Card.Section>
            </Card>
            <Card title="Install Customer Portal">
              <Card.Section>
                {/* <Button onClick={createScriptTag}>Install Automatically</Button> */}
                <p>
                  Add the Customer Portal snippet to the additional scripts in
                  your order status page. This snippet contains your unique
                  account token that should be kept secret. Make sure you have
                  customer accounts enabled
                </p>
                <br></br>
              </Card.Section>
              <Card.Section title="Step 1: Copy the install snippet">
                <TextField
                  value={copiedContent}
                  multiline={4}
                  disabled
                  style={{
                    backgroundColor: "#f0f0f0", // Light grey background color
                    color: "#888888", // Grey text color
                  }}
                  labelStyle={{
                    fontWeight: "bold", // Make the label bold
                  }}
                />
                <br></br>
                <Button onClick={handleCopyClick}>Copy to Clipboard</Button>
                {toastMarkup}
              </Card.Section>
              <Card.Section title="Step 2: Add to your order status page">
                <h1>
                  Add the snippet to the additional scripts in your{" "}
                  <a href={dynamicLink} target="_blank">
                    order status page
                  </a>
                </h1>
                <br></br>
                <img
                  style={{
                    width: "80vw", // This makes the image take up to 80% of the viewport width
                    maxWidth: "80%", // This ensures the image never exceeds the size of its container
                  }}
                  src={cust2} // Make sure cust1 contains a valid image URL
                  alt="Customer Image"
                />{" "}
              </Card.Section>
              <Card.Section title="Step 3: View Order">
                <h1>
                  Click on View Order to see the checkout page and see the
                  customer portal box embedded onto that page like showed in the
                  photo below
                </h1>
                <br></br>
                {/* <img
                  style={{
                    width: "80vw", // This makes the image take up to 80% of the viewport width
                    maxWidth: "50%", // This ensures the image never exceeds the size of its container
                  }} // Set the width using inline styles
                  src={cust3} // Make sure cust1 contains a valid image URL
                  alt="Customer Image"
                />{" "} */}
                <br></br>
                <br></br>
                <Button onClick={getOrder}>View Order Status</Button>
              </Card.Section>
            </Card>
            <Card
              title="Customer editing"
              primaryFooterAction={{
                content: "Save",
                onAction: () => {
                  // setToastContent(selected);
                  // toggleActive();
                  updatePreference({
                    time_to_edit: timeStringToSeconds(selected),
                  });
                },
              }}
            >
              {/* Content of the card */}

              <Card.Section>
                <h1>Adjust when customers can edit their orders.</h1>
                <br></br>
                <Select
                  options={options}
                  onChange={handleSelectChange}
                  value={selected}
                />
              </Card.Section>
            </Card>
            <ErrorBanner
              open={error}
              onClose={handleError}
              content={toastContent}
            />
          </Page>
        )
      ) : (
        checkPremiumUserContent()
      )}
    </Frame>
  );
}
