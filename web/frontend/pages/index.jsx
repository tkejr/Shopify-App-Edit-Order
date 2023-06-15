import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";

import { trophyImage } from "../assets";
import { useNavigate } from "@shopify/app-bridge-react";
import { ProductsCard, OrderTable, DatePickerExample } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
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
  const upgrade = async () =>{
    setLoading(true);
    const res = await fetch("/api/upgradeFirst")
      .then((response) => response.json())
      .then((data) => {
        navigate(data.confirmationUrl);

        setLoading(false);

      });
  }
  useEffect(() => {
    fetchRecurringCharges().catch((error) => console.error(error));
    
  }, []);
  const checkPremiumUserContent = () =>{
    return(
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
                { (
                  <Button
                    primary="true"
                    onClick={() => upgrade()}
                  >
                    {loading ? "Loading..." : "Upgrade"}
                  </Button>
                )}
              </Card.Section>
           
         
        </Card>
    )

  }
 
  return (
    <Page title="Editify"
    primaryAction={{
      content: "Feature Request",
      onAction: () => handlePrimaryAction(),
    }}
    
      fullWidth>
      
      <Layout>

        {
        (isPremiumUser) ? checkPremiumUserContent() :
        
        <>
        <Layout.Section oneThird>
          <br></br>
          <br /> 
          <OrderTable
            toggleShow={toggleShow}
            setOrderId={setOrderId}
            setName={setName}
            reloadComp={reloadComp}
          />
        </Layout.Section>
        <Layout.Section oneThird>
          <DatePickerExample
            orderId={orderId}
            orderName={orderName}
            reloadComp={reloadComp}
            setReloadComp={setReloadComp}
          />
        </Layout.Section>
        </>
        }
      </Layout>
    </Page>
  );
}
