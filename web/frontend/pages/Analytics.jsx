import { Card, EmptyState, Page, Layout, Icon, Frame, MediaCard } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { notFoundImage } from "../assets";
import { OrdersMajor, EditMajor, CustomersMajor } from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "../hooks";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "@shopify/app-bridge-react";
export default function Analytics() {
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

  const dispatch = useDispatch();
const navigate = useNavigate();
const isPremiumUser = useSelector((state) => state.isPremiumUser);
  
const planName = useSelector((state) => state.planName);
  
const fetchRecurringCharges = async () => {
  const res = await fetch("/api/check")
    .then((response) => response.json())
    .then((data) => {
      if(data.hasPayment === "pro"){
        
        dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
        dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
     
      }
      else if(data.hasPayment === "starter"){
        
        dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
        dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
      }
      else{
        dispatch({ type: "SET_IS_PREMIUM_USER", payload: false });
      }
      

      //setUserStateLoading(false);
    });
};

useEffect(() => {
  fetchRecurringCharges().catch((error) => console.error(error));
  //new
  dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
  dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
  //dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
}, []);
const checkPremiumUserContent = () => {
  return (
    <Frame>
    
    <MediaCard
    title="See your usage"
    description="Go to the Plans page and select the Pro plan" 
    primaryAction={{
      content: 'Go to Plans',
      onAction: () => {navigate("/Plans")},
    }}
    >
    <img
      alt=""
      width="100%"
      height="100%"
      style={{
        objectFit: 'cover',
        objectPosition: 'center',
      }}
      src="https://cdn.shopify.com/app-store/listing_images/bf5dc60d84716ebd5705f5fbd4e12e90/desktop_screenshot/CJKrvcvBnoEDEAE=.png?height=1800&width=3200"
    />
  </MediaCard>
    </Frame>
  );
};


  return (
    <>
      {((planName==="pro" )  && isPremiumUser) ? 
      (<Page title="Analytics" titleMetadata="Tracking Since 09/10/23">
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
      </Page>) : checkPremiumUserContent()
}
    </>
  );
}
