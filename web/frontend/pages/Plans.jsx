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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";

import { trophyImage } from "../assets";
import { useNavigate } from "@shopify/app-bridge-react";
import { ProductsCard, OrderTable, DatePickerExample } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();

  const [activeResizify, setActiveResizify] = useState(false);
  const [activeReview, setActiveReview] = useState(false);

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
        dispatch({ type: "SET_IS_PREMIUM_USER", payload: data.hasPayment });

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
    //new
    dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
    dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
    //dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
  }, []);

  return (
    <Page
      title="Plans"
      //secondaryActions={[
      //  {
      //    content: "Leave A Review",
      //    accessibilityLabel: "Secondary action label",
      //    onAction: () => handleChangeReview(),
      //  },
      //  {
      //    content: "Check out Resizify",
      //    onAction: () => handleChangeResizify(),
      //  },
      //]}
      defaultWidth
    >
      

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
                  <Badge progress="complete" status="success">
                    Active
                  </Badge>
                )}
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
                  <Badge progress="complete" status="success">
                    Active
                  </Badge>
                )}
              </Card.Section>
            </MediaCard>
          </Layout.Section>
        </>
      </Layout>
    </Page>
  );
}
