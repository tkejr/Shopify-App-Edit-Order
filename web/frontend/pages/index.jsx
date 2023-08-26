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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";

import { trophyImage } from "../assets";
import { useNavigate } from "@shopify/app-bridge-react";
import { ProductsCard, OrderTable, DatePickerExample } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  //new function to compare dates
  // not the most efficient in the slightest but we move
  const compareDates = () => {
    const lastDateStringResizify = localStorage.getItem("timeOfOpenResizify");
    const lastDateResizify = new Date(lastDateStringResizify);
    const lastDateMonthResizify = lastDateResizify.getMonth();
    const lastDateStringReview = localStorage.getItem("timeOfOpenReview");
    const lastDateReview = new Date(lastDateStringReview);
    const lastDateMonthReview = lastDateReview.getMonth();
    const date = new Date ();
    const dateMonth = date.getMonth();
   
    
      
      if(lastDateMonthResizify > dateMonth){
        localStorage.removeItem("timeOfOpenResizify");
        localStorage.setItem("timeOfOpenResizify", date);
        return true;
      }
      else if(lastDateMonthReview > dateMonth){
        localStorage.removeItem("timeOfOpenReview");
        localStorage.setItem("timeOfOpenReview", date);
        return true; 
      }
       else {
      
      return false;
      }
  }
  const [activeResizify, setActiveResizify] = useState((compareDates()) ? true : false);
  const [activeReview, setActiveReview] = useState((compareDates()) ? true : false);
  
    
  
  const handleChangeResizify = useCallback(
    () => {localStorage.setItem("timeOfOpenResizify", date); setActiveResizify(!activeResizify);},
    [activeResizify]
  );
  const handleChangeReview = useCallback(
    () => {localStorage.setItem("timeOfOpenReview", date);setActiveReview(!activeReview)},
    [activeReview]
  );
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

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();
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
        dispatch({ type: "SET_IS_PREMIUM_USER", payload: data.hasPayment });

        setUserStateLoading(false);
      });
  };
  const upgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/upgradeFirst")
      .then((response) => response.json())
      .then((data) => {
        navigate(data.confirmationUrl);

        setLoading(false);
      });
  };
  const downgrade = async () => {
    setLoading(true);

    const res = await fetch("/api/downgrade")
      .then((response) => response.json())
      .then((data) => {
        navigate(data.basicUrl);

        setLoading(false);
      });
  };
  useEffect(() => {
    fetchRecurringCharges().catch((error) => console.error(error));
  }, []);
  const checkPremiumUserContent = () => {
    return (
      <Card
        sectioned
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Card.Section>
          <TextContainer spacing="loose">
            <h2>Upgrade to keep using Editify</h2>
          </TextContainer>
          <br></br>
        </Card.Section>
        <Card.Section>
          {
            <Button primary="true" onClick={() => upgrade()}>
              {loading ? "Loading..." : "Upgrade"}
            </Button>
          }
        </Card.Section>
      </Card>
    );
  };

  return (
    <Page
      title="Editify"
      secondaryActions={[
        {
          content: "Leave A Review",
          accessibilityLabel: "Secondary action label",
          onAction: () => handleChangeReview(),
        },
        {
          content: "Check out Resizify",
          onAction: () => handleChangeResizify(),
        },
      ]}
      fullWidth
    >
      <hr></hr>

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

      <Layout>
        {!isPremiumUser ? (
          checkPremiumUserContent()
        ) : (
          <>
            <Layout.Section oneHalf>
              <OrderTable
                toggleShow={toggleShow}
                setOrderId={setOrderId}
                setName={setName}
                reloadComp={reloadComp}
              />
            </Layout.Section>
            <Layout.Section oneHalf>
              <DatePickerExample
                orderId={orderId}
                orderName={orderName}
                reloadComp={reloadComp}
                setReloadComp={setReloadComp}
              />
            </Layout.Section>
          </>
        )}
      </Layout>
    </Page>
  );
}
