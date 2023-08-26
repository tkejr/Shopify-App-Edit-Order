import {Page, Badge,Banner,  Card, PageActions, Layout, Button, Modal, TextContainer,  IndexTable, useIndexResourceState} from '@shopify/polaris';
import React from 'react';
import {Autocomplete, Icon} from '@shopify/polaris';
import {SearchMinor} from '@shopify/polaris-icons';
import {useState, useCallback, useMemo, useEffect} from 'react';
import {MediaCard} from '@shopify/polaris';
import { useAuthenticatedFetch } from "../hooks";
import { TitleBar, ResourcePicker } from '@shopify/app-bridge-react';
import { ProductsCard, OrderTable, DatePickerExample, EditOrderComponent, OrderTableEditOrder } from "../components";
import { useSelector, useDispatch } from "react-redux";


const PageExample = () => {
    
    const [show, setShow] = useState(false);
  const [reloadComp, setReloadComp] = useState(false);
  const toggleShow = () => {
    if (!show) {
      setShow(true);
    }
  };
  const [orderId, setOrderId] = useState(0);
  const [orderName, setName] = useState();
  const [lineItems, setLineItems] = useState();
  const [loading, setLoading] = useState(false);
    //charges 
    //const [loading, setLoading] = useState(false);
    const isPremiumUser = useSelector((state) => state.isPremiumUser);
    const dispatch = useDispatch();
    //const navigate = useNavigate();
    const fetchRecurringCharges = async () => {
        const res = await fetch("/api/check")
          .then((response) => response.json())
          .then((data) => {
            dispatch({ type: "SET_IS_PREMIUM_USER", payload: data.hasPayment });
    
            //setUserStateLoading(false);
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

const fetch = useAuthenticatedFetch();
    
  //open modal
  const date = new Date();
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => {
  setActive(!active)}, [active]);
 

  return (
    <Page
      title="Editify"
      secondaryActions={[
        {
          content: "What is this page for? ",
          accessibilityLabel: "Secondary action label",
          onAction: () => handleChange(),
        },
        
      ]}
      fullWidth
    >
      <hr></hr>
      <Modal
        //activator={activator}
        open={active}
        onClose={handleChange}
        title="Purpose of Page"
        
      >
        <Modal.Section>
        <TextContainer>
            <p>
              Sometimes, a merchant is unable to edit an order that has been backdated. If that is the case, this page is here so a merchant can still edit their 
              unfulfilled order.
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
              <OrderTableEditOrder
                toggleShow={toggleShow}
                setOrderId={setOrderId}
                setName={setName}
                reloadComp={reloadComp}
                setLineItems={setLineItems}
              />
            </Layout.Section>
            <Layout.Section oneHalf>
              <EditOrderComponent
                orderId={orderId}
                orderName={orderName}
                reloadComp={reloadComp}
                setReloadComp={setReloadComp}
                lineItems={lineItems}
               />
            </Layout.Section>
          </>
        )}
      </Layout>
    </Page>
  );
}

export default PageExample;
