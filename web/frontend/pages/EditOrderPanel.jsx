

import {
    Box, 
    Page,
    LegacyCard,
    Button,
    Select,
    Layout,
    Spinner,
    Modal,
    TextField,
    Toast,
    Frame,
    ButtonGroup,
    TextContainer
} from '@shopify/polaris'; 
import {
   DuplicateMinor,
   SendMajor,
   MobileBackArrowMajor
  } from '@shopify/polaris-icons';
import {useState, useCallback, useEffect} from 'react';
import { useNavigate, useAuthenticatedFetch} from '@shopify/app-bridge-react';
import { useSelector, useDispatch } from "react-redux";
import { TitleBar, ResourcePicker } from "@shopify/app-bridge-react";
import AddedProduct from '../components/helpersForEditOrder/AddedProduct';
import LineItemList from '../components/helpersForEditOrder/LineItemList';
import ErrorBanner from '../components/ErrorBanner';
import AdjustQuantity from '../components/helpersForEditOrder/AdjustQuantity';
import AddLineItemDiscount from '../components/helpersForEditOrder/AddLineItemDiscount';
import AddCustomItem from '../components/helpersForEditOrder/AddCustomItem';
import UpdateShippingAddress from '../components/helpersForEditOrder/UpdateShippingAddress';
import AdvancedEditingPanel from '../components/helpersForEditOrder/AdvancedEditingPanel';
import UpdateBillingAddress from '../components/helpersForEditOrder/UpdateBillingAddress';
import InvoiceModal from '../components/SendInvoice';
const ResourceDetailsLayout = () => {
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const dispatch = useDispatch(); 
    const orderId = useSelector((state) => state.orderId);
    const orderName = useSelector((state) => state.orderName);
    //orderName
    const [orderNameNative, setOrderNameNative] = useState();
    //toggle between modes
    const [selected, setSelected] = useState('Simple Mode');
    const handleSelectChange = useCallback((value) => setSelected(value),[],);
    const options = [
    {label: 'Simple Mode', value: 'Simple Mode'},
    {label: 'Advanced Mode', value: 'Advanced Mode'},
    ];
    // send invoice modal
    const [openInvoice, setOpenInvoice] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const handleInvoiceModal = useCallback(() => setOpenInvoice(!openInvoice), [openInvoice]);
    //toast
    const emptyToastProps = { content: null };
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const toastMarkup = toastProps.content && (
        <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
    );
    //error  banner stuff
    const [errorContent, setErrorContent] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState(false);
    const handleError = () => {setError(!error);};
    //line items stuff
    const [line_items, setLineItems] = useState([]);
    const [reload, setReload] = useState(false);
    const [status, setStatus] = useState("");
    const [product, setProduct] = useState([]);
    const [productId, setProductId] = useState("");
    const [showProducts, setShowProducts] = useState(false);
    //open resource picker
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const handleSelection = (resources) => {
        let selection = resources.selection;
        setProduct(selection);
        setProductId("" + selection[0].variants[0].id);
        setShowProducts(true);
      };
    const removeProduct = () => {
        setProduct([]);
        setProductId("");
        setShowProducts(false);
      };
    //big function to add a product
    const addProductVariant = async () => {
        setStatus("loading");
        let result = productId.substring(29);
        const requestOptions = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        };
        const response = await fetch(
          "/api/addProduct/" + orderId + "/" + result,
          requestOptions
        );
        if (response.ok) {
          setToastProps({ content: "Order updated" });
          setProduct([]);
          setProductId("");
          setShowProducts(false);
        } else {
          setErrorContent(
            "There was an error adding the product to the order. See the reasons why that may be the case here: "
          );
          setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
          handleError();
        }
    
        setReload(!reload);
        setStatus("success");
      };
    //quantity stuff
    const [activeQuantity, setActiveQuantity] = useState(false);
    const handleChangeQuantity = useCallback(
        () => setActiveQuantity(!activeQuantity),
        [activeQuantity]
        );
    const [quantity, setQuantity] = useState("1");
    const [originalQuantity, setOriginalQuantity] = useState("");
    const [lineItemId, setLineItemId] = useState();
    const handleId = useCallback((value) => setLineItemId(value), []);
    const openQuantity = (id, quantity) => {
        //setErrorContent("");
        //setModalError(false);
        handleId(id);
        setQuantity("" + quantity);
        setOriginalQuantity("" + quantity);
        handleChangeQuantity();
      };
      //add line item discounts
    const [activeLineItemDiscounts, setActiveLineItemDiscounts] = useState(false);
    const [currencyCode, setCurrencyCode] = useState("");
    const handleChangeAddLineItemDiscounts = useCallback(
        () => setActiveLineItemDiscounts(!activeLineItemDiscounts),
        [activeLineItemDiscounts]
        );
      const openLineItemDiscounts = (id, currencyCode) => {
        //setErrorContent("");
        //setModalError(false);
        handleId(id);
        setCurrencyCode(currencyCode)
        //setQuantity("" + quantity);
        //setOriginalQuantity("" + quantity);
        //handleChangeQuantity();
        handleChangeAddLineItemDiscounts()
      };
    //add custom item
    const [activeCustomItem, setActiveCustomItem] = useState(false);
    const handleChangeCustomItem = useCallback(() => setActiveCustomItem(!activeCustomItem), [activeCustomItem]);
    //shipping address stuff
    const [shippingDetails, setShippingDetails] = useState(null);
    const [activeShipping, setActiveShipping] = useState(false);
    const handleChangeShipping = useCallback(
    () => setActiveShipping(!activeShipping),
    [activeShipping]
    );
    const handleFieldChangeShipping = (fieldName, value) => {
        setShippingDetails({
          ...shippingDetails,
          [fieldName]: value,
        });
      };

    //billing address stuff
    const [billingDetails, setBillingDetails] = useState(null);
    const [activeBilling, setActiveBilling] = useState(false);
    const handleChangeBilling = useCallback(
      () => setActiveBilling(!activeBilling),
      [activeBilling]
    );
    const handleFieldChangeBilling = (fieldName, value) => {
        setBillingDetails({
          ...billingDetails,
          [fieldName]: value,
        });
      };
    //shipping cost
    const [shippingCostDetails, setShippingCostDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleShippingLines = (fieldName, value, index) => {
        let update = [...shippingCostDetails];
        if (fieldName === "price") {
          update[0].price = value;
        } else {
          update[0].title = value;
        }
    
        setShippingCostDetails(update);
      };
    //discount codes
    const [discounts, setDiscounts] = useState(null);
    const handleDiscounts = (fieldName, value, index) => {
        let update = [...discounts];
        if (fieldName === "type") {
          update[0].type = value;
        }else if(fieldName === "code"){
            update[0].code = value;
        } else {
          update[0].amount = value;
        }
    
        setDiscounts(update);
      };
      //big 
      const updateOrderShippingCosts = async () => {
        //setUpdateButton("Loading...");
        setLoading(true);
        /*
        if(!discountsChanged){
            //alert("here, discounts did not change")
            //console.log(discounts)
            setDiscounts([])
        }
        */
        const data = {
          shippingCostDetails: shippingCostDetails,
          discount_codes: (discountsChanged ? discounts : []),
        };
        try {
          const response = await fetch(`/api/shipping/${orderId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
    
          if (!response.ok) {
            throw new Error("Failed to update order details");
          }
          setLoading(false);
          setToastProps({ content: "Order details updated successfully" });
          dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
          dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
          dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
          setLineItems([]);
          navigate("/EditOrder")
        } catch (error) {
          // Handle error, e.g., show an error message
          //console.error("Error updating shipping details:", error);
          setLoading(false);
         setErrorContent(
            "There was an error updating the order details to the order. See the reasons why that may be the case here: "
          );
          setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
          handleError();
        }
       // setUpdateButton("Update");
        //props.setReloadComp(!props.reloadComp);
       
       
      };
      //
     
      const [showSave, setShowSave] = useState(false);
      const [discountsChanged, setDiscountsChanged] = useState(false);
    //new
    const isPremiumUser = useSelector((state) => state.isPremiumUser);
    const planName = useSelector((state) => state.planName);
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
          }else if (data.hasPayment === "starterAnnual") {
            dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
            dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
          } else if (data.hasPayment === "proAnnual") {
            dispatch({ type: "SET_PLAN_NAME", payload: data.hasPayment });
            dispatch({ type: "SET_IS_PREMIUM_USER", payload: true });
          }  else {
            dispatch({ type: "SET_IS_PREMIUM_USER", payload: false });
          }
  
          setUserStateLoading(false);
        });
    };
    useEffect(() => {
      fetchRecurringCharges().catch((error) => console.error(error));
    
    }, []);
    const checkPremiumUserContent = () => {
      return (
        <Frame>
          <LegacyCard title="Edit any Order how you need it">
                <LegacyCard.Section>
                  <TextContainer>
                    <p>
                    Sometimes, when importing orders, Shopify does not let a merchant edit the order further. We solve that. Go to the Plans page and select the Pro plan.
                    If you think we missed anything, contact us and we will work on adding that functionality right away. 
                    </p>
                  </TextContainer>
                  
                </LegacyCard.Section>
                <LegacyCard.Section>
                <Button onClick={()=>navigate("/plans")}>Go to Plans</Button>
                </LegacyCard.Section>
          </LegacyCard>
         
        </Frame>
      );
    };
    useEffect(() => {
        if(!orderId){
            navigate("/EditOrder")
        }
        if(!orderName){
          getOrderName()
        }
        
        if (orderId  && selected === "Simple Mode") {
          getLineItems();
          getOrderShipping();
          getOrderEmail();
        }
        else if(orderId  && selected === "Advanced Mode"){
            
            getOrderShippingCost();
            getOrderBilling();
            getOrderDiscounts();
            getOrderEmail();
        }
      }, [reload, selected]);
      const getLineItems = async () => {
        setStatus("loading");
        setProduct([]);
        setProductId("");
        setShowProducts(false);
    
        fetch("/api/lineItems/" + orderId)
          .then((response) => response.json())
          .then((json) => {
            setLineItems(json);
            //console.log(json);
    
            setStatus("success");
          });
      };
      const getOrderShipping = async () => {
        fetch("/api/orderBilling/shipping/" + orderId)
          .then((response) => response.json())
          .then((json) => {
            setShippingDetails(json);
            //console.log("========",json);
          });
      };
      //next three are for advanced
      const getOrderShippingCost = async () => {
        fetch("/api/shipping/" + orderId)
          .then((response) => response.json())
          .then((json) => {
            setShippingCostDetails(json);
            
          });
      };
      const getOrderBilling = async () => {
        fetch("/api/orderBilling/" + orderId)
          .then((response) => response.json())
          .then((json) => {
            setBillingDetails(json);
            //console.log("here isn fsf ");
          });
      };
      const getOrderDiscounts = async () => {
        fetch("/api/discount/" + orderId)
          .then((response) => response.json())
          .then((json) => {
            setDiscounts(json);
            //console.log(json)
          });
      };
      const getOrderEmail = async () => {
        const requestOptions = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          //body: JSON.stringify({ date: newDate }),
        };
        fetch(`/api/orderBilling/email/${orderId}`, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            setEmailTo(data.email);
          });
      };
      //newCode
     const getOrderName = async () => {
   
    
    fetch("/api/orderName/" + orderId)
    .then((response) => response.json())
    .then((json) => {
      setOrderNameNative(json);
      //console.log("=======",json)
    });
  
  
};

   
    return (
    <Frame>
        
      { (planName === 'pro' || planName === 'proAnnual') && isPremiumUser ? (
      <Page
        //backAction={{content: 'Orders', url: '#'}}
        //backAction={<Button onClick={() => console.log('dfnsjfjk')}>dsfdsf</Button>}
        title={orderNameNative ? orderNameNative : orderName}
        primaryAction={showSave && (selected !== "Simple Mode") && <Button variant="primary" loading={loading} onClick={()=> updateOrderShippingCosts()}>Save</Button>}
        secondaryActions={[
          {
            content: "Back to Orders",
            icon:  MobileBackArrowMajor,
            accessibilityLabel: "Secondary action label",
            onAction: () => navigate("/EditOrder"),
          },
          {
            content: "Send Invoice",
            icon: SendMajor,
            accessibilityLabel: "Secondary action label",
            onAction: () => handleInvoiceModal(),
          },
          
        ]}
        
      >
         
        {
        <ErrorBanner
          open={error}
          onClose={handleError}
          content={errorContent}
          url={url}
          buttonText={"Learn More"}
        ></ErrorBanner>
      }
        <Layout>
        <Layout.Section>
          <LegacyCard title="Choose your edit mode" sectioned>
            {
               ((selected === 'Simple Mode') ?(<p>
                In Simple Mode,you can edit the quantity of products in your order. You can also add new products. A common flow is adding a 
                new product then decrementing the old product to zero quantity, essentially deleting a product from an order.
                You can also change the shipping address.
              </p>) : (<p>
                In Advanced Mode, you can add/edit a discount to an order, change the billing address, or add/edit a shipping cost.
            </p>)) 
            }
            
            <br></br>
            {/*
            <Select
                label="Mode"
                options={options}
                onChange={handleSelectChange}
                value={selected}
            />
          */}
            <ButtonGroup variant="segmented">
              <Button pressed={selected === 'Simple Mode'} onClick={()=> handleSelectChange('Simple Mode')} >Simple Mode </Button>
              <Button pressed={selected === 'Advanced Mode'} onClick={()=> handleSelectChange('Advanced Mode')}>Advanced Mode</Button>
            </ButtonGroup>
          </LegacyCard>
          {selected==="Simple Mode" ? (<LegacyCard title="Order Details" sectioned>
        <Layout.Section>
          {orderId ? (
            <>
                <Button onClick={() => handleChange()}>Add Product</Button>
                <Button onClick={() => handleChangeCustomItem()}>Add Custom Item</Button>
                </>
          ) : (
            <Button disabled={true} >
              Pick an Order
            </Button>
          )}
          </Layout.Section>
          <LegacyCard.Section title="Items">
          {status !== "success" ? (
            <Spinner accessibilityLabel="Spinner example" size="large" />
          ) : (
            <LineItemList line_items={line_items} openQuantity={openQuantity} openLineItemDiscounts= {openLineItemDiscounts}/>
          )}

        </LegacyCard.Section>
        {showProducts && (   
          <AddedProduct product={product} removeProduct={removeProduct}/>
        )}
        {productId && (
          <LegacyCard.Section>
            <Button primary onClick={() => addProductVariant()}>
              Confirm
            </Button>
          </LegacyCard.Section>
        )}
          </LegacyCard>) : (
          <AdvancedEditingPanel 
          shippingCostDetails={shippingCostDetails} 
          setShippingCostDetails={setShippingCostDetails}
          handleShippingLines={handleShippingLines}
          discounts={discounts}
          handleDiscounts={handleDiscounts}
          setDiscounts={setDiscounts}
          setShowSave={setShowSave}
          setDiscountsChanged={setDiscountsChanged}/>
          )  
}
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <LegacyCard title={selected} sectioned>
             In Simple Mode, the changes you make will not make a new order. In Advanced mode, due to shopify api limitations, a new order will be 
              created with the updated information
          </LegacyCard>
          <LegacyCard title={selected === 'Simple Mode' ? 'Shipping Address' : 'Billing Address'} sectioned>
                {
                    (selected === "Simple Mode" ? (<Button onClick={() => handleChangeShipping()}>
                    Edit
                  </Button>) : (<Button onClick={() => handleChangeBilling()}>
                  Edit
                </Button>))
                }
                 
          </LegacyCard>
        </Layout.Section>
            
        </Layout>
       <InvoiceModal openInvoice={openInvoice} handleInvoiceModal={handleInvoiceModal} emailTo = {emailTo} setEmailTo={setEmailTo} handleError={handleError}
        setErrorContent={setErrorContent}
        setUrl={setUrl}
        setToastProps={setToastProps} />
        <ResourcePicker
        resourceType="Product"
        actionVerb="select"
        showVariants={false}
        selectMultiple={false}
        open={active}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => console.log("cancelled")}
      />
      <AdjustQuantity 
        activeQuantity={activeQuantity}
        handleChangeQuantity={handleChangeQuantity}
        quantity={quantity}
        setQuantity={setQuantity}
        originalQuantity={originalQuantity}
        lineItemId={lineItemId}
        handleError={handleError}
        setErrorContent={setErrorContent}
        setUrl={setUrl}
        setReload={setReload}
        reload={reload}
        setToastProps={setToastProps}/>
        <AddCustomItem
        activeCustomItem={activeCustomItem}
        handleChangeCustomItem={handleChangeCustomItem}
        quantity={quantity}
        setQuantity={setQuantity}
        originalQuantity={originalQuantity}
        lineItemId={lineItemId}
        handleError={handleError}
        setErrorContent={setErrorContent}
        setUrl={setUrl}
        setReload={setReload}
        reload={reload}
        setToastProps={setToastProps}/>
        <AddLineItemDiscount
        activeLineItemDiscounts = {activeLineItemDiscounts}
        handleChangeAddLineItemDiscounts = {handleChangeAddLineItemDiscounts}
        currencyCode={currencyCode}
        lineItemId={lineItemId}
        handleError={handleError}
        setErrorContent={setErrorContent}
        setUrl={setUrl}
        setReload={setReload}
        reload={reload}
        setToastProps={setToastProps}/>
        <UpdateShippingAddress 
        activeShipping={activeShipping}
        handleChangeShipping={handleChangeShipping}
        shippingDetails={shippingDetails}
        setShippingDetails={setShippingDetails}
        handleFieldChangeShipping={handleFieldChangeShipping}
        handleError={handleError}
        setErrorContent={setErrorContent}
        setUrl={setUrl}
        setToastProps={setToastProps}
        />
        <UpdateBillingAddress 
        activeBilling={activeBilling}
        handleChangeBilling={handleChangeBilling}
        billingDetails={billingDetails}
        setBillingDetails={setBillingDetails}
        handleFieldChangeBilling={handleFieldChangeBilling}
        handleError={handleError}
        setErrorContent={setErrorContent}
        setUrl={setUrl}
        setToastProps={setToastProps}
        />
      </Page>) : checkPremiumUserContent()
}
      {toastMarkup}
      </Frame>
    )
  }

  export default ResourceDetailsLayout; 