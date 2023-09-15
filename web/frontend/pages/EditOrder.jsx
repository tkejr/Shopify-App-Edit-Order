import {
  Page,
  Badge,
  Banner,
  MediaCard,
  Frame,
  Layout,
  Button,
  Modal,
  TextContainer,
  IndexTable,
  useIndexResourceState,
} from "@shopify/polaris";
import React from "react";
import { Autocomplete, Icon } from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { useState, useCallback, useMemo, useEffect } from "react";
import CustomSkeletonPage from "../components/SkeletonPage";
import { useAuthenticatedFetch } from "../hooks";
import {
  TitleBar,
  ResourcePicker,
  useNavigate,
} from "@shopify/app-bridge-react";
import {
  ProductsCard,
  OrderTable,
  DatePickerExample,
  EditOrderComponent,
  OrderTableEditOrder,
} from "../components";
import ErrorBanner from "../components/ErrorBanner";
import { useSelector, useDispatch } from "react-redux";
import { edit_paywall } from "../assets";

const PageExample = () => {
  const [show, setShow] = useState(false);
  const [reloadComp, setReloadComp] = useState(false);
  const [userStateLoading, setUserStateLoading] = useState(true);
  const toggleShow = () => {
    if (!show) {
      setShow(true);
    }
  };
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState(0);
  const [orderName, setName] = useState();
  const [lineItems, setLineItems] = useState();
  const [loading, setLoading] = useState(false);
  //charges
  //const [loading, setLoading] = useState(false);
  const isPremiumUser = useSelector((state) => state.isPremiumUser);
  const planName = useSelector((state) => state.planName);
  const dispatch = useDispatch();
  //const navigate = useNavigate();
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

    //dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
    //dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
    //dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
  }, []);
  const checkPremiumUserContent = () => {
    return (
      <Frame>
        <MediaCard
          title="Edit any order"
          description="Sometimes, when importing orders, Shopify does not let a merchant edit the order further. We solve that. Go to the Plans page and select the Pro plan."
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

  //open modal
  const date = new Date();
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => {
    setActive(!active);
  }, [active]);

  const [url, setUrl] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [error, setError] = useState(false);
  const handleError = () => {
    setError(!error);
  };
  return (
    <Page title="Edit Order" defaultWidth>
      {
        <ErrorBanner
          open={error}
          onClose={handleError}
          content={errorContent}
          url={url}
          buttonText={"Learn More"}
        ></ErrorBanner>
      }
      {userStateLoading ? (
        <CustomSkeletonPage></CustomSkeletonPage>
      ) : (
        <Layout>
          {planName === "pro" && isPremiumUser ? (
            <>
              <Layout.Section oneHalf>
                {
                  <OrderTableEditOrder
                    toggleShow={toggleShow}
                    setOrderId={setOrderId}
                    setName={setName}
                    reloadComp={reloadComp}
                    setLineItems={setLineItems}
                  />
                }
              </Layout.Section>
              <Layout.Section oneHalf>
                <EditOrderComponent
                  orderId={orderId}
                  orderName={orderName}
                  reloadComp={reloadComp}
                  setReloadComp={setReloadComp}
                  lineItems={lineItems}
                  setErrorContent={setErrorContent}
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
};

export default PageExample;
