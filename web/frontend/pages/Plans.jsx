import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Button,
  Modal,
  TextStyle,
  Badge,
  MediaCard,
  Frame,
  VideoThumbnail,
  SkeletonPage,
  
  SkeletonDisplayText,
  SkeletonBodyText
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";
import CustomSkeletonPage from '../components/SkeletonPage'
import { trophyImage } from "../assets";
import { useNavigate } from "@shopify/app-bridge-react";
import { ProductsCard, OrderTable, DatePickerExample } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";

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

  return (
    <Page
      title="Plans"
      defaultWidth
    >
       
        { userStateLoading ? (
          
         <CustomSkeletonPage></CustomSkeletonPage>
        
        ) : 
        (
        <Layout>
          <>
        
          <Layout.Section oneHalf>
            <MediaCard
              portrait
              title="Pro Plan"
              description="With this plan, get all of the backdating and order editing capabilities as well as a customer portal"
              //popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
            >
              <img
                alt=""
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                src="https://cdn.shopify.com/app-store/listing_images/bf5dc60d84716ebd5705f5fbd4e12e90/desktop_screenshot/CPW1ysvBnoEDEAE=.png?height=1800&width=3200"
              />

              <Card.Section>
                {(!isPremiumUser || planName === "starter") && (
                  <Button onClick={() => upgradePro()}>
                    {" "}
                    {loading ? "Loading..." : "Get Pro Plan"}
                  </Button>
                )}
                {planName === "pro" && (
                  <div style={{padding:'8px'}}>
                  <Badge progress="complete" status="success">
                    {" "}
                    Active
                  </Badge>
                  
                 
                  </div>
                )}
                {"    "}
              </Card.Section>
            </MediaCard>
          </Layout.Section>
          <Layout.Section oneHalf>
            <MediaCard
              portrait
              title="Starter Plan"
              description="With this plan, backdate your orders and have them show up in your analytics, no customer portal"
              //popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
            >
              <img
                alt=""
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                src="https://cdn.shopify.com/app-store/listing_images/bf5dc60d84716ebd5705f5fbd4e12e90/desktop_screenshot/CJKrvcvBnoEDEAE=.png?height=1800&width=3200"
              />

              <Card.Section>
                {(!isPremiumUser || planName === "pro") && (
                  <Button onClick={() => upgradeStarter()}>
                    {" "}
                    {loadingStarter ? "Loading..." : "Get Starter Plan"}
                  </Button>
                )}
                {planName === "starter" && (
                  <div style={{padding:'8px'}}>
                  <Badge progress="complete" status="success">
                    {" "}
                    Active
                  </Badge>
                  </div>
                )}
              </Card.Section>
            </MediaCard>
          </Layout.Section>

        </>
        </Layout>
        )
}    
      
    </Page>
  );
}
