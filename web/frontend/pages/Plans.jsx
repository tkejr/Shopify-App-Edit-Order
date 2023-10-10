import {
  Card,
  Page,
  Layout,
  Link,
  Button,
  Badge,
} from "@shopify/polaris";
import PlanCard from "../components/PlanCard";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";
//import CustomSkeletonPage from "../components/SkeletonPage";

import { useNavigate } from "@shopify/app-bridge-react";

import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";
import {chatify_logo, editify_logo, resizify_logo} from '../assets'
export default function HomePage() {
  const fetch = useAuthenticatedFetch();

  const [loading, setLoading] = useState(false);
  const [loadingStarter, setLoadingStarter] = useState(false);
  const isPremiumUser = useSelector((state) => state.isPremiumUser);

  const planName = useSelector((state) => state.planName);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userStateLoading, setUserStateLoading] = useState(true);

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
  const upgradeStarter = async () => {
    setLoadingStarter(true);
    const res = await fetch("/api/upgradeStarter")
      .then((response) => response.json())
      .then((data) => {
        navigate(data.confirmationUrl);

        setLoadingStarter(false);
      });
  };
  const upgradePro = async () => {
    setLoading(true);
    const res = await fetch("/api/upgradePro")
      .then((response) => response.json())
      .then((data) => {
        navigate(data.confirmationUrl);

        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecurringCharges().catch((error) => console.error(error));
    //new
    dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
    dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
    //dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
  }, []);
//Backdate Orders
//Edit Shipping Cost
//Edit Billing Address
//Send Invoice
//Accurate Shopify Analytics
//Financial Reporting
//Customer Portal
  return (
    <Page title="Plans" defaultWidth>
      {(
        <Layout>
          <>
            <Layout.Section oneHalf>
              <Card sectioned>
                <PlanCard
                  planName="Starter Plan"
                  price="4.99"
                  features={[
                    "Backdate Orders",
                    "Unlimited Date Edits",
                    "Updates Sales in Shopify Analytics",
                    "Edit Shipping Cost, Billing Address, Send Invoice",
                    "Customer self-service editing with Customer Portal",
                    "Priority Support",
                  ]}
                  upgrade={upgradeStarter}
                ></PlanCard>

                <Card.Section>
                 
                  {(!isPremiumUser || planName === "pro") && (
                    <Button onClick={() => upgradeStarter()}>
                      {" "}
                      {loadingStarter ? "Loading..." : "Get Starter Plan"}
                    </Button>
                  )}
                  {planName === "starter" && (
                    <div style={{ padding: "6px" }}>
                      <Badge progress="complete" status="success">
                        {" "}
                        Active
                      </Badge>
                    </div>
                  )}
                </Card.Section>
              </Card>
            </Layout.Section>
            <Layout.Section oneHalf>
              <Card sectioned>
                <PlanCard
                  planName="Pro Plan"
                  price="9.99"
                  features={[
                    "Backdate Orders",
                    "Add/Remove and Change Quantity of Products from Order",
                    "Accurate Shopify Analytics",
                    "Edit Shipping Cost, Billing Address, Send Invoice",
                    "Customer self-service editing with Customer Portal",
                    "Priority Support",
                  ]}
                  upgrade={upgradePro}
                ></PlanCard>

                <Card.Section>
                 
                  {(!isPremiumUser || planName === "starter") && (
                    <Button onClick={() => upgradePro()}>
                      {" "}
                      {loading ? "Loading..." : "Get Pro Plan"}
                    </Button>
                  )}
                  {planName === "pro" && (
                    <div style={{ padding: "8px" }}>
                      <Badge progress="complete" status="success">
                        {" "}
                        Active
                      </Badge>
                    </div>
                  )}
                  {"    "}
                </Card.Section>
              </Card>
            </Layout.Section>
            <Layout.Section full>
              <Card title="Partner Apps & Reviews">
                <Card.Section>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={editify_logo}
                      alt="Your Image Description"
                      style={{
                        borderRadius: "8px",
                        marginRight: "10px",
                        width: "50px",
                        height: "50px",
                      }}
                    />
                    <p style={{ margin: 0 }}>
                      If you like our App and want one month free please leave a
                      review {"  "}
                      <Link url="https://apps.shopify.com/editify/reviews">
                        Here
                      </Link>
                    </p>
                  </div>
                </Card.Section>
                <Card.Section>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={resizify_logo}
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
                      src={chatify_logo}
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
              <br></br>

              <div style={{ height: "30px" }}></div>
            </Layout.Section>
          </>
        </Layout>
      )}
    </Page>
  );
}
