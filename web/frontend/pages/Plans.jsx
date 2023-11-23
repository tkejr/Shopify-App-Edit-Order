import {
  LegacyCard,
  Page,
  Layout,
  Link,
  Button,
  Badge,
  Banner,
  Text
} from "@shopify/polaris";
import PlanCard from "../components/PlanCard";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";
//import CustomSkeletonPage from "../components/SkeletonPage";

import { useNavigate } from "@shopify/app-bridge-react";

import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";
import {chatify_logo, editify_logo, resizify_logo} from '../assets';
import { sendToAnalytics } from "../../lcp-helper";
import { getLCP } from "web-vitals";

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
    function handleLCP(metric){
      sendToAnalytics(metric, "Plans Page")
    }
    getLCP(handleLCP);
  }, []);
  const price = <Text as="p" textDecorationLine="line-through">
  $4.99
</Text>; 
 const price2 = <Text as="p" textDecorationLine="line-through">
 $9.99
</Text>; 
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
          
            <Layout.Section variant="oneHalf">
              <LegacyCard sectioned>
                <PlanCard
                  planName="Starter Plan"
                  price={price}
                  newPrice="$3.99"
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

                <LegacyCard.Section>
                 
                  {(!isPremiumUser || planName === "pro") && (
                    <Button variant="primary" onClick={() => upgradeStarter()}>
                      {" "}
                      {loadingStarter ? "Loading..." : "Get Starter Plan"}
                    </Button>
                  )}
                  {planName === "starter" && (
                    <div style={{ padding: "4px" }}>
                      <Badge progress="complete" tone="success">
                        {" "}
                        Active
                      </Badge>
                    </div>
                  )}
                </LegacyCard.Section>
              </LegacyCard>
            </Layout.Section>
            <Layout.Section variant="oneHalf">
              <LegacyCard sectioned>
                <PlanCard
                  planName="Pro Plan"
                  price={price2}
                  newPrice="$7.99"
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

                <LegacyCard.Section>
                 
                  {(!isPremiumUser || planName === "starter") && (
                    <Button variant="primary" onClick={() => upgradePro()}>
                      {" "}
                      {loading ? "Loading..." : "Get Pro Plan"}
                    </Button>
                  )}
                  {planName === "pro" && (
                    <div style={{ padding: "4px" }}>
                      <Badge progress="complete" tone="success">
                        {" "}
                        Active
                      </Badge>
                    </div>
                  )}
                  {"    "}
                </LegacyCard.Section>
              </LegacyCard>
            </Layout.Section>
            <Layout.Section full>
            <Banner onDismiss={() => {}}>
              <p>
               Black Friday Sale! Now each plan is 20% off!{' '}
               
              </p>
            </Banner>
            <br></br>
              <LegacyCard title="Partner Apps & Reviews">
                <LegacyCard.Section>
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
                </LegacyCard.Section>
                <LegacyCard.Section>
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
                </LegacyCard.Section>
                <LegacyCard.Section>
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
                </LegacyCard.Section>
              </LegacyCard>
              <br></br>

              <div style={{ height: "30px" }}></div>
            </Layout.Section>
          </>
        </Layout>
      )}
    </Page>
  );
}
