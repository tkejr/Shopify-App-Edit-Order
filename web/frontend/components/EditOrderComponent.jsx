import {
  Spinner,
  TextField,
  Toast,
  Frame,
  LegacyCard,
  PageActions,
  Layout,
  Button,
  Modal,
  ButtonGroup,
  SkeletonThumbnail,
  Banner,
  FormLayout,
} from "@shopify/polaris";
import React from "react";
import { Autocomplete, Icon } from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { useState, useCallback, useMemo, useEffect } from "react";
import { MediaCard, ResourceList, Thumbnail } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";
import { TitleBar, ResourcePicker } from "@shopify/app-bridge-react";
import { primaryAction } from "@shopify/app-bridge/actions/Toast";
import { useSelector, useDispatch } from "react-redux";
import ErrorBanner from "../components/ErrorBanner";
import { DeleteMajor } from "@shopify/polaris-icons";
import InvoiceModal from "../components/SendInvoice";

export function EditOrderComponent(props) {
  const fetch = useAuthenticatedFetch();
  const orderId = useSelector((state) => state.orderId);
  const orderName = useSelector((state) => state.orderName);
  const [line_items, setLineItems] = useState([]);
  const [reload, setReload] = useState(false);
  const [fulfillable, setFulfillable] = useState(0);
  const [status, setStatus] = useState("success");
  const [source, setSource] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [error, setError] = useState(false);
  const [billingDetails, setBillingDetails] = useState(null);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [shippingCostDetails, setShippingCostDetails] = useState(null);
  const [taxLines, setTaxLines] = useState(null);
  const [updateButton, setUpdateButton] = useState("Update");
  const dispatch = useDispatch();
  const handleFieldChange = (fieldName, value) => {
    setBillingDetails({
      ...billingDetails,
      [fieldName]: value,
    });
  };
  const handleFieldChangeShipping = (fieldName, value) => {
    setShippingDetails({
      ...shippingDetails,
      [fieldName]: value,
    });
  };
  const handleTaxLines = (fieldName, value, index) => {
    let newState;
    if (fieldName === "title") {
      newState = taxLines.map((obj, index2) => {
        if (index2 === index) {
          return { ...obj, title: value };
        }
        return obj;
      });
    } else {
      newState = taxLines.map((obj, index2) => {
        if (index2 === index) {
          return { ...obj, rate: value };
        }
        return obj;
      });
    }

    setTaxLines(newState);
  };
  const handleShippingLines = (fieldName, value, index) => {
    let update = [...shippingCostDetails];
    if (fieldName === "price") {
      update[0].price = value;
    } else {
      update[0].title = value;
    }

    setShippingCostDetails(update);
  };
  const handleError = () => {
    setError(!error);
  };
  const [modalError, setModalError] = useState(false);
  const handleModalError = () => {
    setModalError(!modalError);
  };
  useEffect(() => {
    if (orderId && orderName) {
      getLineItems();
      getOrderBilling();
      getOrderShipping();
      getOrderShippingCost();
      getOrderTaxLines();
    }
  }, [props.orderId, reload]);

  const [product, setProduct] = useState([]);
  const [productId, setProductId] = useState("");
  const emptyToastProps = { content: null };
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handleSelection = (resources) => {
    let selection = resources.selection;

    setProduct(selection);
    setProductId("" + selection[0].variants[0].id);
    setShowProducts(true);
  };
  const addProductVariant = async () => {
    setStatus("loading");
    let result = productId.substring(29);

    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      //body: JSON.stringify({ date: newDate }),
    };
    const response = await fetch(
      "/api/addProduct/" + orderId + "/" + result,
      requestOptions
    );
    if (response.ok) {
      setToastProps({ content: "Order updated" });
      props.setReloadComp(!props.reloadComp);
      setProduct([]);
      setProductId("");
      setShowProducts(false);
    } else {
      //setIsLoading(false);

      //banner error

      props.setErrorContent(
        "There was an error adding the product to the order. See the reasons why that may be the case here: "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }

    setReload(!reload);
    setStatus("success");
  };

  const [showProducts, setShowProducts] = useState(false);
  const changeAmount = async () => {
    //error that belongs in modal
    if (quantity === originalQuantity) {
      setErrorContent(
        `Please select a quantity that is different from the original quantity: ${originalQuantity}`
      );
      handleModalError();
    } else if (originalQuantity === "0") {
      //another error that belongs in modal
      setErrorContent(
        "Cannot change the quantity of a product that was originally zero"
      );
      handleModalError();
    } else {
      setStatus("loading");
      const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ date: newDate }),
      };
      const response = await fetch(
        "/api/changeAmount/" + orderId + "/" + lineItemId + "/" + quantity,
        requestOptions
      );
      if (response.ok) {
        setToastProps({ content: "Quantity updated" });
        props.setReloadComp(!props.reloadComp);
      } else {
        //banner error
        props.setErrorContent(
          "There was an error updating the quantity. For more information on why this could have happened, click the button below: "
        );
        props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
        props.handleError();
      }
      handleChangeQuantity();
      setReload(!reload);
      setStatus("success");
    }
  };
  const openQuantity = (id, quantity) => {
    setErrorContent("");
    setModalError(false);

    handleId(id);
    //setFulfillable(quantity)
    setQuantity("" + quantity);
    setOriginalQuantity("" + quantity);

    handleChangeQuantity();
  };
  //

  const getOrderBilling = async () => {
    fetch("/api/orderBilling/" + orderId)
      .then((response) => response.json())
      .then((json) => {
        setBillingDetails(json);
        //console.log("here isn fsf ");
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
  const getOrderShippingCost = async () => {
    fetch("/api/shipping/" + orderId)
      .then((response) => response.json())
      .then((json) => {
        setShippingCostDetails(json);
        
      });
  };
  const getOrderTaxLines = async () => {
    fetch("/api/shipping/taxLines/" + orderId)
      .then((response) => response.json())
      .then((json) => {
        setTaxLines(json);
        //console.log(json)
      });
  };

  const updateOrderBilling = async () => {
    setUpdateButton("Loading...");
    try {
      const response = await fetch(`/api/orderBilling/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to update billing details");
      }
      setToastProps({ content: "Details updated successfully" });
    } catch (error) {
      // Handle error, e.g., show an error message
      console.error("Error updating billing details:", error);
      props.setErrorContent(
        "There was an error updating the billing details to the order. See the reasons why that may be the case here: "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
      props.setReloadComp(!props.reloadComp);
    }
    setUpdateButton("Update");
    props.setReloadComp(!props.reloadComp);
    setActiveBilling(false);
  };
  const updateOrderShipping = async () => {
    setUpdateButton("Loading...");

    try {
      const response = await fetch(`/api/orderBilling/shipping/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shippingDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to update shipping details");
      }

      setToastProps({ content: "Details updated successfully" });
    } catch (error) {
      // Handle error, e.g., show an error message
      console.error("Error updating billing details:", error);
      props.setErrorContent(
        "There was an error updating the shipping details to the order. If adding a shipping address, add the correct fields. For US, Province is State. See the reasons why that may be the case here: "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }
    setUpdateButton("Update");
    props.setReloadComp(!props.reloadComp);
    setActiveShipping(false);
  };
  const updateOrderShippingCosts = async () => {
    setUpdateButton("Loading...");
    const data = {
      shippingCostDetails: shippingCostDetails,
      taxLines: taxLines,
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
        throw new Error("Failed to update shipping details");
      }

      setToastProps({ content: "Shipping details updated successfully" });
    } catch (error) {
      // Handle error, e.g., show an error message
      console.error("Error updating shipping details:", error);
      props.setErrorContent(
        "There was an error updating the shipping details to the order. See the reasons why that may be the case here: "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }
    setUpdateButton("Update");
    props.setReloadComp(!props.reloadComp);
    setActiveShippingCosts(false);
    dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
    dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
    dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
    setLineItems([]);
  };
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

  const [lineItemId, setLineItemId] = useState();
  const handleId = useCallback((value) => setLineItemId(value), []);

  //open modal
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => setActive(!active), [active]);
  //

  //open billing modal
  const [activeBilling, setActiveBilling] = useState(false);
  const handleChangeBilling = useCallback(
    () => setActiveBilling(!activeBilling),
    [activeBilling]
  );

  const [activeShipping, setActiveShipping] = useState(false);
  const handleChangeShipping = useCallback(
    () => setActiveShipping(!activeShipping),
    [activeShipping]
  );
  const [activeShippingCosts, setActiveShippingCosts] = useState(false);
  const handleChangeShippingCosts = useCallback(
    () => setActiveShippingCosts(!activeShippingCosts),
    [activeShippingCosts]
  );
  const [activeQuantity, setActiveQuantity] = useState(false);
  const handleChangeQuantity = useCallback(
    () => setActiveQuantity(!activeQuantity),
    [activeQuantity]
  );
  const [quantity, setQuantity] = useState("1");

  const handleQuantityChange = (number) => {
    if (number < 0) {
      setErrorContent("Quantity must be at least 0"); //error in modal for sure
      handleModalError();
    } else {
      setQuantity("" + number);
    }
  };
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [originalQuantity, setOriginalQuantity] = useState("");
  //const [options, setOptions] = useState(deselectedOptions);
  
  const removeProduct = () => {
    setProduct([]);
    setProductId("");
    setShowProducts(false);
  };
  const shippingLines = shippingCostDetails?.map((shippingDetail, index) => (
    <FormLayout.Group>
      <TextField
        type="text"
        label="Title"
        value={shippingDetail.title || ""}
        onChange={(value) => handleShippingLines("title", value, index)}
      />
      <TextField
        type="text"
        label="Price"
        value={shippingDetail.price || ""}
        onChange={(value) => handleShippingLines("price", value, index)}
      />
    </FormLayout.Group>
  ));
  const [expanded, setExpanded] = useState(false);
  const taxLinesArray = taxLines?.map((tax, index) => (
    <FormLayout.Group>
      <div style={{ display: "flex" }}>
        <TextField
          type="text"
          label="Name"
          value={tax.title || ""}
          onChange={(value) => handleTaxLines("title", value, index)}
        />

        <TextField
          type="text"
          label="Rate"
          value={tax.rate || ""}
          onChange={(value) => handleTaxLines("rate", value, index)}
        />
        <Button plain destructive onClick={() => deleteTaxLine(tax)}>
          {" "}
          <div style={{ marginTop: "20px" }}>
            <Icon source={DeleteMajor} color="critical" />{" "}
          </div>
        </Button>
      </div>
    </FormLayout.Group>
  ));
  const addShipping = () => {
    setShippingCostDetails([{ title: "", price: "" }]);
  };
  const addShippingAddress = () => {
    setShippingDetails({
      first_name: '', 
      last_name:'', 
      address1: '', 
      address2: '', 
      phone: '', 
      province:'',
      city: '',
      zip: '',

       });
  };
  const addBillingAddress = () => {
    setBillingDetails({
      first_name: '', 
      last_name:'', 
      address1: '', 
      address2: '', 
      phone: '', 
      province:'',
      city: '',
      zip: '',

       });
  };
  const addTaxLine = () => {
    const userInput = {
      title: "",
      rate: 0.0,
    };
    const updatedTaxLines = [...taxLines];
    updatedTaxLines.push(userInput);
    setTaxLines(updatedTaxLines);
  };
  const deleteTaxLine = (value) => {
    setTaxLines((oldValues) => {
      return oldValues.filter((tax) => tax !== value);
    });
  };

  const addDiscount = async (id, quantity) =>{
    console.log(id, quantity, orderId)
   
      setStatus("loading");
      const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ date: newDate }),
      };
      const response = await fetch(
        "/api/discount/" + orderId + "/" + id + "/" + quantity,
        requestOptions
      );
      console.log(response)
      if (response.ok) {
        setToastProps({ content: "Discount added" });
        props.setReloadComp(!props.reloadComp);
      } else {
        //banner error
        props.setErrorContent(
          "There was an error updating the quantity. For more information on why this could have happened, click the button below: "
        );
        props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
        props.handleError();
      }
      handleChangeQuantity();
      setReload(!reload);
      setStatus("success");
    
  }
  return (
    <Frame>
      <LegacyCard
        title={
          orderName ? `Order Details for Order ${orderName}` : "Pick an Order"
        }
      >
        <LegacyCard.Section>
          {orderId ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ButtonGroup>
                <Button onClick={() => handleChange()}>Add Product</Button>
                <Button onClick={() => handleChangeShipping()}>
                  Shipping Address
                </Button>
                <Button onClick={() => handleChangeBilling()}>
                  Billing Address
                </Button>
                <Button onClick={() => handleChangeShippingCosts()}>
                  Shipping Costs
                </Button>

                <InvoiceModal orderId={orderId} />
              </ButtonGroup>
            </div>
          ) : (
            <Button disabled={true} onClick={() => handleChange()}>
              Pick an Order
            </Button>
          )}
        </LegacyCard.Section>

        <LegacyCard.Section title="Items">
          {status !== "success" ? (
            <Spinner accessibilityLabel="Spinner example" size="large" />
          ) : (
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={line_items}
              renderItem={(item) => {
                const {
                  id,
                  url,
                  name,
                  sku,
                  price,
                  media,
                  fulfillable_quantity,
                  product_id,
                  price_set,
                } = item;

                const media2 = <Thumbnail source={media} alt="placeholder" />;

                return (
                  <ResourceList.Item
                    id={id}
                    url={url}
                    media={media2}
                    accessibilityLabel={`View details for ${name}`}
                  >
                    <div> {name}</div>
                    <div>
                      Price: {price} {price_set.shop_money.currency_code}
                    </div>
                    <div>SKU: {sku}</div>
                    <div>x{fulfillable_quantity} unfulfilled </div>
                    <Button
                      plain
                      onClick={() => openQuantity(id, fulfillable_quantity)}
                    >
                      Adjust Quantity
                    </Button>
                    <br></br>
                    {
                    <Button
                      plain
                      onClick={() => addDiscount(id, fulfillable_quantity)}
                    >
                      Add Discount
                    </Button>
                }
                    <br></br>
                  </ResourceList.Item>
                );
              }}
            />
          )}
        </LegacyCard.Section>
        {showProducts && (
          <LegacyCard.Section title="Product to be Added">
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={product}
              renderItem={(item) => {
                const { id, title, url, images } = item;

                let image;
                let hasPicture = true;
                if (images[0]) {
                  image = images[0].originalSrc;
                } else {
                  hasPicture = false;
                }
                return (
                  <ResourceList.Item
                    id={id}
                    url={url}
                    media={
                      hasPicture ? (
                        <Thumbnail source={image} alt="picture of product" />
                      ) : (
                        <SkeletonThumbnail />
                      )
                    }
                  >
                    <div> {title}</div>
                    <div style={{ alignItems: "right", float: "right" }}>
                      <Button plain destructive onClick={() => removeProduct()}>
                        Remove
                      </Button>
                    </div>
                  </ResourceList.Item>
                );
              }}
            />
          </LegacyCard.Section>
        )}
        {productId && (
          <LegacyCard.Section>
            <Button primary onClick={() => addProductVariant()}>
              Confirm
            </Button>
          </LegacyCard.Section>
        )}
      </LegacyCard>

      <ResourcePicker
        resourceType="Product"
        actionVerb="select"
        showVariants={false}
        selectMultiple={false}
        open={active}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => console.log("cancelled")}
      />

      <Modal
        //activator={activator}
        open={activeQuantity}
        onClose={handleChangeQuantity}
        title="Adjust Quantity"
        primaryAction={{
          content: "Save",
          onAction: () => changeAmount(),
        }}
      >
        {modalError && (
          <div style={{ padding: "10px" }}>
            <Banner
              title="Error"
              onDismiss={() => handleModalError()}
              status="critical"
            >
              <p>{errorContent}</p>
            </Banner>
          </div>
        )}

        <Modal.Section>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(number) => handleQuantityChange(number)}
            error={quantity < 0}
            autoComplete="off"
          />
        </Modal.Section>
      </Modal>

      <Modal
        //Billing
        // activator={activator}
        open={activeBilling}
        onClose={handleChangeBilling}
        title="Order Billing Address"
        primaryAction={{
          content: updateButton,
          onAction: updateOrderBilling,
        }}
      >
      
          <Modal.Section>
            <FormLayout>
            {billingDetails?.status === 'none' ? (<Button onClick={()=> addBillingAddress()}> Add Billing Address</Button>) : (
              <>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="Address 1"
                  value={billingDetails?.address1}
                  onChange={(value) => handleFieldChange("address1", value)}
                />
                <TextField
                  type="text"
                  label="Address 2"
                  value={billingDetails?.address2 || ""}
                  onChange={(value) => handleFieldChange("address2", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="City"
                  value={billingDetails?.city}
                  onChange={(value) => handleFieldChange("city", value)}
                />
                <TextField
                  type="text"
                  label="Country"
                  value={billingDetails?.country}
                  onChange={(value) => handleFieldChange("country", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="First Name"
                  value={billingDetails?.first_name || ""}
                  onChange={(value) => handleFieldChange("first_name", value)}
                />
                <TextField
                  type="text"
                  label="Last Name"
                  value={billingDetails?.last_name}
                  onChange={(value) => handleFieldChange("last_name", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                {/* <TextField
                type="text"
                label="Latitude"
                value={billingDetails.latitude || ""}
                onChange={(value) => handleFieldChange("latitude", value)}
              /> */}
              </FormLayout.Group>

              <FormLayout.Group>
                <TextField
                  type="text"
                  label="Phone"
                  value={billingDetails?.phone || ""}
                  onChange={(value) => handleFieldChange("phone", value)}
                />
                <TextField
                  type="text"
                  label="Province"
                  value={billingDetails?.province}
                  onChange={(value) => handleFieldChange("province", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                {/* <TextField
                type="text"
                label="Province Code"
                value={billingDetails.province_code}
                onChange={(value) => handleFieldChange("province_code", value)}
              /> */}
                <TextField
                  type="text"
                  label="ZIP"
                  value={billingDetails?.zip}
                  onChange={(value) => handleFieldChange("zip", value)}
                />
              </FormLayout.Group>
              </>)}
            </FormLayout>
          </Modal.Section>
        
      </Modal>

      <Modal
        
        open={activeShipping}
        onClose={handleChangeShipping}
        title="Order Shipping Address"
        primaryAction={{
          content: updateButton,
          onAction: updateOrderShipping,
        }}
      >
        
          <Modal.Section>
            <FormLayout>
              {shippingDetails?.status === 'none' ? (<Button onClick={()=> addShippingAddress()}> Add Shipping Address</Button>) : (
                <>
              <FormLayout.Group>

                <TextField
                  type="text"
                  label="Address 1"
                  value={shippingDetails?.address1}
                  onChange={(value) =>
                    handleFieldChangeShipping("address1", value)
                  }
                />
                <TextField
                  type="text"
                  label="Address 2"
                  value={shippingDetails?.address2 || ""}
                  onChange={(value) =>
                    handleFieldChangeShipping("address2", value)
                  }
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="City"
                  value={shippingDetails?.city}
                  onChange={(value) => handleFieldChangeShipping("city", value)}
                />
                <TextField
                  type="text"
                  label="Country"
                  value={shippingDetails?.country}
                  onChange={(value) =>
                    handleFieldChangeShipping("country", value)
                  }
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="First Name"
                  value={shippingDetails?.first_name || ""}
                  onChange={(value) =>
                    handleFieldChangeShipping("first_name", value)
                  }
                />
                <TextField
                  type="text"
                  label="Last Name"
                  value={shippingDetails?.last_name}
                  onChange={(value) =>
                    handleFieldChangeShipping("last_name", value)
                  }
                />
              </FormLayout.Group>
              <FormLayout.Group>
                {/* <TextField
                type="text"
                label="Latitude"
                value={billingDetails.latitude || ""}
                onChange={(value) => handleFieldChange("latitude", value)}
              /> */}
              </FormLayout.Group>

              <FormLayout.Group>
                <TextField
                  type="text"
                  label="Phone"
                  value={shippingDetails?.phone || ""}
                  onChange={(value) =>
                    handleFieldChangeShipping("phone", value)
                  }
                />
                <TextField
                  type="text"
                  label="Province"
                  value={shippingDetails?.province}
                  onChange={(value) =>
                    handleFieldChangeShipping("province", value)
                  }
                />
              </FormLayout.Group>
              <FormLayout.Group>
                {/* <TextField
                type="text"
                label="Province Code"
                value={billingDetails.province_code}
                onChange={(value) => handleFieldChange("province_code", value)}
              /> */}
                <TextField
                  type="text"
                  label="ZIP"
                  value={shippingDetails?.zip}
                  onChange={(value) => handleFieldChangeShipping("zip", value)}
                />
              </FormLayout.Group>
              </>
              )}
            </FormLayout>
          </Modal.Section>
        
      </Modal>
      <Modal
        //Billing
        // activator={activator}
        open={activeShippingCosts}
        onClose={handleChangeShippingCosts}
        title="Shipping Costs"
        primaryAction={{
          content: updateButton,
          onAction: updateOrderShippingCosts,
        }}
      >
        {
          <Modal.Section>
            <FormLayout>
              {shippingCostDetails == false ? (
                <Button onClick={() => addShipping()}>Add Shipping</Button>
              ) : (
                <>{shippingLines}</>
              )}
              {/* <div style={{ padding: "10px" }}>
                <Button
                  plain
                  disclosure={expanded ? "up" : "down"}
                  onClick={() => {
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? "Close" : "Shipping Taxes"}
                </Button>
              </div>
              {expanded && (
                <>
                  <Button onClick={() => addTaxLine()}>Add Tax Line</Button>
                  {taxLinesArray}
                </>
              )} */}
            </FormLayout>
          </Modal.Section>
        }
      </Modal>
      {toastMarkup}
    </Frame>
  );
}
