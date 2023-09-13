import { Card, EmptyState, Page, Layout, Icon } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { notFoundImage } from "../assets";
import { OrdersMajor, EditMajor, CustomersMajor } from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const [shopDeets, setShopDeets] = useState();
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
        } else {
          // Handle non-successful response (e.g., show an error message)
        }
      } catch (error) {
        console.error("Error getting analytics", error);
      }
    };

    getAnalytics();
  }, []);
  return (
    <Page title="Editify" titleMetadata="Tracking Since 09/10/23">
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
    </Page>
  );
}
