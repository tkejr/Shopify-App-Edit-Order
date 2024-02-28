import {
  Page,
  Layout,
  TextContainer,
  Modal,
  Frame,
  LegacyCard,
  Button,
  Banner
} from "@shopify/polaris";
import { getLCP } from "web-vitals";
import React, { useState, useEffect, useCallback } from "react";
//import CustomSkeletonPage from "../components/SkeletonPage";
import ErrorBanner from "../components/ErrorBanner";

import { useNavigate } from "@shopify/app-bridge-react";
import {  OrderTable, DatePickerExample } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";
import { edit_paywall } from "../assets";
import { sendToAnalytics } from "../../lcp-helper";



export default function Backdate() {
  
  const fetch = useAuthenticatedFetch();
  
  //using random

  const [activeResizify, setActiveResizify] = useState(
    (Math.random() <= 0.05 ? true : false) ? true : false
  );
  const [activeReview, setActiveReview] = useState(
    (Math.random() <= 0.05 ? true : false) ? true : false
  );

  const handleChangeResizify = useCallback(() => {
    setActiveResizify(!activeResizify);
  }, [activeResizify]);
  const handleChangeReview = useCallback(() => {
    setActiveReview(!activeReview);
  }, [activeReview]);
  const redirectToResizify = () => {
    window.open("https://apps.shopify.com/compress-files", "_blank");
  };
  const redirectToEditify = () => {
    window.open("https://apps.shopify.com/editify", "_blank");
  };
  //const activator = <Button onClick={handleChange}>Open</Button>;

  const [show, setShow] = useState(false);
  const [reloadComp, setReloadComp] = useState(false);
  const toggleShow = () => {
    if (!show) {
      setShow(true);
    }
  };
  const [orderId, setOrderId] = useState(0);
  const [orderName, setName] = useState();
  const [loading, setLoading] = useState(false);
  const isPremiumUser = useSelector((state) => state.isPremiumUser);

  const planName = useSelector((state) => state.planName);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userStateLoading, setUserStateLoading] = useState(true);
  const handlePrimaryAction = () => {
    window.open(
      "https://resizify.canny.io/resizify-feature-requests",
      "_blank"
    );
  };
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
        } 
        else {
          dispatch({ type: "SET_IS_PREMIUM_USER", payload: false });
        }

        setUserStateLoading(false);
      });
  };

  useEffect(() => {
    fetchRecurringCharges().catch((error) => console.error(error));
    //new
    //dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
    //dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
    //dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
    function handleLCP(metric){
      sendToAnalytics(metric, "Backdate Page")
    }
    getLCP(handleLCP);
    
  }, []);
  const checkPremiumUserContent = () => {
    return (
      <Frame>
         <LegacyCard title="Welcome to Editify">
              <LegacyCard.Section>
                {
                <TextContainer>
                  <p>
                    Backdate/Postdate Orders and have them accurately reflected in your analytics. Go to Plans and select any plan to get this functionality
                  </p>
                </TextContainer>
    }
                
              </LegacyCard.Section>
              <LegacyCard.Section>
              <Button onClick={()=>navigate("/Plans")}>Go to Plans</Button>
              </LegacyCard.Section>
          </LegacyCard>
      </Frame>
    );
  };

  //error stuff
  const [url, setUrl] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [buttonText, setButtonText] = useState("Contact Support");
  const [error, setError] = useState(false);
  const handleError = () => {
    setError(!error);
  };
  const [showBanner, setBanner] = useState(true);
  return (
    <Page title="Backdate Order" defaultWidth>

     
      <Modal
        //activator={activator}
        open={activeResizify}
        onClose={handleChangeResizify}
        title="Check out our other app, Resizify!"
        primaryAction={{
          content: "Check out app",
          onAction: redirectToResizify,
        }}
      >
        <Modal.Section>
          {
          <TextContainer>
            <p>
              Install this app to compress your store's images and upload from
              anywhere! You can upload from Instagram, Google Drive, and more!
            </p>
          </TextContainer>
      }
        </Modal.Section>
      </Modal>

      <Modal
        //activator={activator}
        open={activeReview}
        onClose={handleChangeReview}
        title="Leave a Review"
        primaryAction={{
          content: "Leave a Review",
          onAction: redirectToEditify,
        }}
      >
        <Modal.Section>
          {
          <TextContainer>
            <p>
              Leave us a review on the Shopify app store to tell us what you think!
            </p>
          </TextContainer>
    }
        </Modal.Section>
      </Modal>

      {
        <ErrorBanner
          open={error}
          onClose={handleError}
          content={errorContent}
          url={url}
          buttonText={buttonText}
          buttonAction={() => {
            navigate("/Help");
          }}
        ></ErrorBanner>
      }
      { (
        <Layout>
          {(planName === "pro" || planName === "starter" || planName === "starterAnnual" || planName === "proAnnual" ) && isPremiumUser ? (
            <>
               {false && <Banner onDismiss={() => {setBanner(false)}}>
              <p>
               If a transaction went through on an order you are trying to backdate, it will say that an error occurred when you backdate. 
               Do not worry, a backdated order still gets created. Cancel the old order once you are satisfied with the new backdated one{' '}
               
              </p>
            </Banner>
}
              <Layout.Section variant="oneHalf">
                
                {
                  <OrderTable
                    toggleShow={toggleShow}
                    setOrderId={setOrderId}
                    setName={setName}
                    reloadComp={reloadComp}
                  />
           }
              </Layout.Section>
              <Layout.Section  variant="oneHalf">
                {
                <DatePickerExample
                  orderId={orderId}
                  orderName={orderName}
                  reloadComp={reloadComp}
                  setReloadComp={setReloadComp}
                  setErrorContent={setErrorContent}
                  setButtonText={setButtonText}
                  setUrl={setUrl}
                  handleError={handleError}
                />
              }
              </Layout.Section>
             
            </>
          ) : (
            checkPremiumUserContent()
          )}
        </Layout>
          )}
    </Page>
  );
}
