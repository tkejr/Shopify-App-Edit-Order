import {
  Page,
  Layout,
  TextContainer,
  Modal,
  Frame,
  MediaCard,
} from "@shopify/polaris";

import React, { useState, useEffect, useCallback } from "react";
//import CustomSkeletonPage from "../components/SkeletonPage";
import ErrorBanner from "../components/ErrorBanner";

import { useNavigate } from "@shopify/app-bridge-react";
import {  OrderTable, DatePickerExample } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";
import { edit_paywall } from "../assets";


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
        } else {
          dispatch({ type: "SET_IS_PREMIUM_USER", payload: false });
        }

        setUserStateLoading(false);
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
          title="Discover how Editify can help you"
          description="Upgrade to any plan to Backdate/Postdate any order"
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
      </Frame>
    );
  };

  //error stuff
  const [url, setUrl] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [buttonText, setButtonText] = useState("Learn More");
  const [error, setError] = useState(false);
  const handleError = () => {
    setError(!error);
  };
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
          <TextContainer>
            <p>
              Install this app to compress your store's images and upload from
              anywhere! You can upload from Instagram, Google Drive, and more!
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>

      <Modal
        //activator={activator}
        open={activeReview}
        onClose={handleChangeReview}
        title="Leave a Review on this app and get one month free!"
        primaryAction={{
          content: "Leave a Review",
          onAction: redirectToEditify,
        }}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              Leave us a review on the Shopify app store and get one month free!
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>

      {
        <ErrorBanner
          open={error}
          onClose={handleError}
          content={errorContent}
          url={url}
          buttonText={buttonText}
        ></ErrorBanner>
      }
      { (
        <Layout>
          {(planName === "pro" || planName === "starter") && isPremiumUser ? (
            <>
              <Layout.Section oneHalf>
                {
                  <OrderTable
                    toggleShow={toggleShow}
                    setOrderId={setOrderId}
                    setName={setName}
                    reloadComp={reloadComp}
                  />
                }
              </Layout.Section>
              <Layout.Section oneHalf>
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
