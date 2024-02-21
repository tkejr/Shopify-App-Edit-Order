import {
  LegacyCard,
  Page,
  Layout,
  Icon,
  TextContainer,
  Frame,
  Link,
  FooterHelp,
  List,
  CalloutCard,
  Card,
  BlockStack,
  Bleed,
  Text,
  Box,
  InlineStack,
  InlineGrid,
  ButtonGroup,
  Button,
} from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";

import {
  OrderIcon,
  EditIcon,
  PersonFilledIcon,
  CheckCircleIcon,
  MinusCircleIcon,
 
} from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "../hooks";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@shopify/app-bridge-react";
//import CustomSkeletonPage from "../components/SkeletonPage";
import { sendToAnalytics } from "../../lcp-helper";
import { getLCP } from "web-vitals";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [shopDeets, setShopDeets] = useState();
  const [planIcon, setPlanIcon] = useState(null);
  const [editedIcon, setEditedIcon] = useState(null);
  const [loader, setLoader] = useState(true);
  const [showPlan, setShowPlan] = useState(false);
  const [showTry, setShowTry] = useState(false);
  const showSetup = useSelector((state) => state.showSetup);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chargeId = urlParams.get("charge_id");
    const type = urlParams.get("type");
    const orderId = urlParams.get("id");

    if (type === "edit") {
      dispatch({ type: "SET_PROPS_ORDER_ID", payload: orderId });
      navigate("/EditOrder");
    }
    if (type === "backdate") {
      dispatch({ type: "SET_PROPS_ORDER_ID", payload: orderId });
      navigate("/Backdate");
    }
    const getAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          //console.log(data.data);
          setShopDeets(data.data);
          if (data.data.no_back_orders > 0) {
            setEditedIcon(
              <Icon source={CheckCircleIcon} color="success" backdrop />
            );
          } else {
            setEditedIcon(
              <Icon source={MinusCircleIcon} color="critical" backdrop />
            );
            setShowTry(true);
          }
        } else {
          // Handle non-successful response (e.g., show an error message)
        }
      } catch (error) {
        console.error("Error getting analytics", error);
      }
    };
    const fetchRecurringCharges = async () => {
      const res = await fetch(`/api/check`)
        .then((response) => response.json())
        .then((data) => {
          if (data.hasPayment === "pro" || data.hasPayment === "starter") {
            setPlanIcon(
              <Icon source={CheckCircleIcon} color="success" backdrop />
            );
          } else {
            setPlanIcon(
              <Icon source={MinusCircleIcon} color="critical" backdrop />
            );
            setShowPlan(true);
          }

          setLoader(false);
        });
    };
    getAnalytics();
    //fetchRecurringCharges();
    function handleLCP(metric) {
      sendToAnalytics(metric, "Index Page");
    }
    getLCP(handleLCP);
  }, []);
  function handlePrimaryActionClick() {
    navigate("/Backdate");
  }

  const handleDismissOnboarding = async () => {
    const updatedData = {
      onboardingdismissed: true,
    };

    try {
      const response = await fetch("/api/analytics", {
        // Replace '/update-user' with your actual route
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedData }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Update successful:", data);
        // Update your shopDeets state here to reflect the changes
        setShopDeets(data);
      } else {
        console.error("Update failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  return (
    <>
      {
        <Frame>
          <Page
            title="Editify"
            //titleMetadata="Tracking Since 09/10/23"
            defaultWidth
          >
            <LegacyCard title="Welcome to Editify">
              <LegacyCard.Section>
                <TextContainer>
                  <p>
                    Backdate Orders, Edit Orders, Customer Self Service Editing
                    and Much More
                  </p>
                  <Text as="p" tone="subdued">
                    Built by <Link target="_blank" url="https://shopvana.io">Shopvana</Link>
                  </Text>
                </TextContainer>
              </LegacyCard.Section>
            </LegacyCard>

            <br></br>
            {
              <Layout>
                <Layout.Section variant="oneThird">
                  <Card>
                    <div
                      style={{
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ marginRight: "10px" }}>
                          {" "}
                          <Text as="h1" variant="bodyLg" fontWeight="bold">
                            Backdated Orders{" "}
                          </Text>
                        </div>
                        <div>
                          {" "}
                          <Icon source={OrderIcon} color="primary" backdrop />
                        </div>
                      </div>
                    </div>
                    <Text as="h1" variant="heading3xl" fontWeight="medium">
                      {shopDeets?.no_back_orders}
                    </Text>
                  </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                  <Card>
                    <div
                      style={{
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ marginRight: "10px" }}>
                          {" "}
                          <Text as="h1" variant="bodyLg" fontWeight="bold">
                            Edited Orders{" "}
                          </Text>
                        </div>
                        <div>
                          {" "}
                          <Icon source={EditIcon} color="primary" backdrop />
                        </div>
                      </div>
                    </div>
                    <Text as="h1" variant="heading3xl" fontWeight="medium">
                      {shopDeets?.no_edit_orders}
                    </Text>
                  </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                  <Card>
                    <div
                      style={{
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ marginRight: "10px" }}>
                          {" "}
                          <Text as="h1" variant="bodyLg" fontWeight="bold">
                            Customer Edited Orders{" "}
                          </Text>
                        </div>
                        <div>
                          {" "}
                          <Icon
                            source={PersonFilledIcon}
                            color="primary"
                            backdrop
                          />
                        </div>
                      </div>
                    </div>
                    <Text as="h1" variant="heading3xl" fontWeight="medium">
                      {shopDeets?.no_edit_orders}
                    </Text>
                  </Card>
                </Layout.Section>
              </Layout>
            }
            <br></br>
            <Layout>
              <Layout.Section>
                {shopDeets && shopDeets.onboardingdismissed == false && (
                  <Card roundedAbove="sm">
                    <BlockStack gap="200">
                      <InlineGrid columns="1fr auto">
                        <Text as="h2" variant="headingSm">
                          Setup Guide
                        </Text>
                        <ButtonGroup>
                          <Button
                            onClick={() => {
                              handleDismissOnboarding();
                            }}
                            variant="tertiary"
                          >
                            <Icon source={MinusCircleIcon} tone="base" />
                          </Button>
                        </ButtonGroup>
                      </InlineGrid>
                      <BlockStack gap="400">
                        <Text as="p" variant="bodyMd">
                          Go to the Plans Page and select your plan. Backdating
                          is only available if you have at least a Starter Plan
                        </Text>
                        <Text
                          as="h3"
                          variant="headingSm"
                          fontWeight="medium"
                        ></Text>
                      </BlockStack>
                      {""}
                      <Bleed marginBlockEnd="400" marginInline="400">
                        <Box background="bg-surface-secondary" padding="400">
                          <BlockStack gap="200">
                            <Text
                              as="h3"
                              variant="headingSm"
                              fontWeight="medium"
                            >
                              How to Backdate an Order
                            </Text>
                            <List>
                              <List.Item>Select an Order</List.Item>
                              <List.Item>Select Date</List.Item>
                              <List.Item>Click Submit</List.Item>
                            </List>
                          </BlockStack>
                        </Box>
                      </Bleed>
                      
                    </BlockStack>
                  </Card>
                )}
              </Layout.Section>
              <Layout.Section oneHalf></Layout.Section>
            </Layout>
            <FooterHelp>
              Learn more about{" "}
              <Link target="_blank" url="https://www.shopvana.io/blog/managing-orders-efficiently-with-editify-order-editor">
                Editify
              </Link>
            </FooterHelp>
          </Page>
        </Frame>
      }
    </>
  );
}