import {
  Card,
  EmptyState,
  Page,
  Layout,
  Icon,
  CalloutCard,
  SkeletonPage,
  SkeletonBodyText,
  TextContainer,
  SkeletonDisplayText,
  Loading,
  Frame,
  Link,
  MediaCard,
  FooterHelp,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { notFoundImage } from "../assets";
import {
  OrdersMajor,
  EditMajor,
  CustomersMajor,
  ChecklistMajor,
  CircleTickMajor,
  CircleCancelMajor,
} from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "../hooks";
import { useNavigate } from "@shopify/app-bridge-react";
import CustomSkeletonPage from "../components/SkeletonPage";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [shopDeets, setShopDeets] = useState();
  const [planIcon, setPlanIcon] = useState(null);
  const [editedIcon, setEditedIcon] = useState(null);
  const [loader, setLoader] = useState(true);
  const [showPlan, setShowPlan] = useState(false);
  const [showTry, setShowTry] = useState(false);

  useEffect(() => {
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
          setShopDeets(data.data);
          if (data.data.no_back_orders > 1) {
            setEditedIcon(
              <Icon source={CircleTickMajor} color="success" backdrop />
            );
          } else {
            setEditedIcon(
              <Icon source={CircleCancelMajor} color="critical" backdrop />
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
      const res = await fetch("/api/check")
        .then((response) => response.json())
        .then((data) => {
          if (data.hasPayment === "pro" || data.hasPayment === "starter") {
            setPlanIcon(
              <Icon source={CircleTickMajor} color="success" backdrop />
            );
          } else {
            setPlanIcon(
              <Icon source={CircleCancelMajor} color="critical" backdrop />
            );
            setShowPlan(true);
          }

          setLoader(false);
        });
    };
    getAnalytics();
    fetchRecurringCharges();
  }, []);
  function handlePrimaryActionClick() {
    navigate("/Backdate");
  }

  return (
    <>
      {loader ? (
        <CustomSkeletonPage></CustomSkeletonPage>
      ) : (
        <Frame>
          <Page
            title="Editify"
            titleMetadata="Tracking Since 09/10/23"
            defaultWidth
          >
            <CalloutCard
              title="Seamlessly Edit Your Orders"
              illustration="https://cdn.pixabay.com/photo/2013/07/13/12/50/pencil-160443_1280.png"
              primaryAction={{
                content: "Backdate Orders",
                onAction: handlePrimaryActionClick,
              }}
            >
              <p>
                Backdate Orders,Edit Orders , Customer Self Service Editing and
                Much More
              </p>
            </CalloutCard>
            <br></br>
            <Layout>
              <Layout.Section oneThird>
                <Card title="Backdated Orders">
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon source={OrdersMajor} color="primary" backdrop />
                      <div style={{ marginLeft: "10px" }}>
                        {shopDeets?.no_back_orders}
                      </div>
                    </div>{" "}
                  </Card.Section>
                </Card>
              </Layout.Section>
              <Layout.Section oneThird>
                <Card title="Edited Orders">
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon source={EditMajor} color="primary" backdrop />
                      <div style={{ marginLeft: "10px" }}>
                        {shopDeets?.no_edit_orders}
                      </div>
                    </div>{" "}
                  </Card.Section>
                </Card>
              </Layout.Section>
              <Layout.Section oneThird>
                <Card title="Customer Edited Orders">
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon source={CustomersMajor} color="primary" backdrop />
                      <div style={{ marginLeft: "10px" }}>
                        {shopDeets?.no_cust_edit_orders}
                      </div>
                    </div>{" "}
                  </Card.Section>
                </Card>
              </Layout.Section>
            </Layout>
            <br></br>
            <Layout>
              <Layout.Section oneHalf>
                <Card title="Setup Guide">
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon source={CircleTickMajor} color="success" backdrop />
                      <div style={{ marginLeft: "10px" }}>
                        <p>Installed App Successfully</p>
                      </div>
                    </div>
                  </Card.Section>
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {planIcon}
                      <div style={{ marginLeft: "10px" }}>
                        <p>
                          Have An Active Paid Plan{" "}
                          {showPlan && (
                            <Link
                              onClick={() => {
                                navigate("/Plans");
                              }}
                            >
                              {" "}
                              See Our Plans
                            </Link>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card.Section>
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {editedIcon}
                      <div style={{ marginLeft: "10px" }}>
                        <p>
                          Edited an Order 🎉{" "}
                          {showTry && (
                            <Link
                              onClick={() => {
                                navigate("/EditOrder");
                              }}
                            >
                              Try Now
                            </Link>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card.Section>
                </Card>
              </Layout.Section>
              <Layout.Section oneHalf>
                <Card title="Partner Apps & Reviews">
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src="https://cdn.shopify.com/app-store/listing_images/bf5dc60d84716ebd5705f5fbd4e12e90/icon/CJ3q_YWkjoADEAE=.png"
                        alt="Your Image Description"
                        style={{
                          borderRadius: "8px",
                          marginRight: "10px",
                          width: "50px",
                          height: "50px",
                        }}
                      />
                      <p style={{ margin: 0 }}>
                        If you like our App and want one month free please leave
                        a review {"  "}
                        <Link url="https://apps.shopify.com/editify/reviews">
                          Here
                        </Link>
                      </p>
                    </div>
                  </Card.Section>
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src="https://cdn.shopify.com/app-store/listing_images/51d8e8f21204bd1d7146f51ba39c01e1/icon/CPyA3YzCsP8CEAE=.png"
                        alt="Your Image Description"
                        style={{
                          borderRadius: "8px",
                          marginRight: "10px",
                          width: "50px",
                          height: "50px",
                        }}
                      />
                      <p style={{ margin: 0 }}>
                        Try our other app to manage images and files{" "}
                        <Link url="https://apps.shopify.com/compress-files?">
                          Install Now
                        </Link>
                      </p>
                    </div>
                  </Card.Section>
                  <Card.Section>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src="https://cdn.shopify.com/app-store/listing_images/4eff7bc91792e22953e8c99acffbf4d5/icon/CPKFpaPfl4EDEAE=.png"
                        alt="Your Image Description"
                        style={{
                          borderRadius: "8px",
                          marginRight: "10px",
                          width: "50px",
                          height: "50px",
                        }}
                      />
                      <p style={{ margin: 0 }}>
                        Power your store with AI sales assistant{" "}
                        <Link url="https://apps.shopify.com/chatify-2">
                          Install Now
                        </Link>
                      </p>
                    </div>
                  </Card.Section>
                </Card>
              </Layout.Section>
            </Layout>
            <FooterHelp>
              Learn more about{" "}
              <Link url="https://editify.kejrtech.com">Editify</Link>
            </FooterHelp>
          </Page>
        </Frame>
      )}
    </>
  );
}
