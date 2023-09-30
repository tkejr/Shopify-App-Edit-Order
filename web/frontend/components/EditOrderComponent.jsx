import {
  Spinner,
  TextField,
  Toast,
  Frame,
  Card,
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
  const [updateButton, setUpdateButton] = useState('Update');
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
        console.log('here isn fsf ')
      });
  };
  const getOrderShipping = async () => {
    fetch("/api/orderBilling/shipping/" + orderId)
      .then((response) => response.json())
      .then((json) => {
        setShippingDetails(json);
      });
  };

  const updateOrderBilling = async () => {
    setUpdateButton("Loading...")
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
      setToastProps({ content: "Billing details updated successfully" });
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
    setUpdateButton('Update')
    props.setReloadComp(!props.reloadComp);
    setActiveBilling(false);
  };
  const updateOrderShipping = async () => {
    setUpdateButton("Loading...")
    
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
      
      setToastProps({ content: "Shipping details updated successfully" });
    } catch (error) {
      // Handle error, e.g., show an error message
      console.error("Error updating billing details:", error);
      props.setErrorContent(
        "There was an error updating the billing details to the order. See the reasons why that may be the case here: "
      );
      props.setUrl("https://help.shopify.com/en/manual/orders/edit-orders");
      props.handleError();
    }
    setUpdateButton('Update')
    props.setReloadComp(!props.reloadComp);
    setActiveShipping(false);
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
  const handleChangeShipping= useCallback(
    () => setActiveShipping(!activeShipping),
    [activeShipping]
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
  const [loading, setLoading] = useState(false);
  const testingEmail = () => {
    fetch("/api/email")
      .then((response) => response.json())
      .then((json) => {
        console.log("flkkk");
      });
  };
  const removeProduct = () => {
    setProduct([]);
    setProductId("");
    setShowProducts(false);
  };

  return (
    <Frame>
      <Card
        title={
          orderName ? `Order Details for Order ${orderName}` : "Pick an Order"
        }
      >
        <Card.Section>
          {orderId ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              
              
              <ButtonGroup>
              <Button onClick={() => handleChange()}>Add Product</Button>
              <Button onClick={() => handleChangeShipping()}>
                  Shipping Address
                </Button>
               <Button onClick={()=>handleChangeBilling()}>Billing Address</Button>
              </ButtonGroup>
            </div>
          ) : (
            <Button disabled={true} onClick={() => handleChange()}>
              Pick an Order
            </Button>
          )}
        </Card.Section>

        <Card.Section title="Items">
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
                  </ResourceList.Item>
                );
              }}
            />
          )}
        </Card.Section>
        {showProducts && (
          <Card.Section title="Product to be Added">
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
          </Card.Section>
        )}
        {productId && (
          <Card.Section>
            <Button primary onClick={() => addProductVariant()}>
              Confirm
            </Button>
          </Card.Section>
        )}
      </Card>

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
        {billingDetails && (
          <Modal.Section>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="Address 1"
                  value={billingDetails.address1}
                  onChange={(value) => handleFieldChange("address1", value)}
                />
                <TextField
                  type="text"
                  label="Address 2"
                  value={billingDetails.address2 || ""}
                  onChange={(value) => handleFieldChange("address2", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="City"
                  value={billingDetails.city}
                  onChange={(value) => handleFieldChange("city", value)}
                />
                <TextField
                  type="text"
                  label="Country"
                  value={billingDetails.country}
                  onChange={(value) => handleFieldChange("country", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="First Name"
                  value={billingDetails.first_name || ""}
                  onChange={(value) => handleFieldChange("first_name", value)}
                />
                <TextField
                  type="text"
                  label="Last Name"
                  value={billingDetails.last_name}
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
                  value={billingDetails.phone || ""}
                  onChange={(value) => handleFieldChange("phone", value)}
                />
                <TextField
                  type="text"
                  label="Province"
                  value={billingDetails.province}
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
                  value={billingDetails.zip}
                  onChange={(value) => handleFieldChange("zip", value)}
                />
              </FormLayout.Group>
            </FormLayout>
          </Modal.Section>
        )}
      </Modal>

      <Modal
        //Billing
        // activator={activator}
        open={activeShipping}
        onClose={handleChangeShipping}
        title="Order Shipping Address"
        primaryAction={{
          content: updateButton,
          onAction: updateOrderShipping,
        }}
      >
        {shippingDetails && (
          <Modal.Section>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="Address 1"
                  value={shippingDetails.address1}
                  onChange={(value) => handleFieldChangeShipping("address1", value)}
                />
                <TextField
                  type="text"
                  label="Address 2"
                  value={shippingDetails.address2 || ""}
                  onChange={(value) => handleFieldChangeShipping("address2", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="City"
                  value={shippingDetails.city}
                  onChange={(value) => handleFieldChangeShipping("city", value)}
                />
                <TextField
                  type="text"
                  label="Country"
                  value={shippingDetails.country}
                  onChange={(value) => handleFieldChangeShipping("country", value)}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="First Name"
                  value={shippingDetails.first_name || ""}
                  onChange={(value) => handleFieldChangeShipping("first_name", value)}
                />
                <TextField
                  type="text"
                  label="Last Name"
                  value={shippingDetails.last_name}
                  onChange={(value) => handleFieldChangeShipping("last_name", value)}
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
                  value={shippingDetails.phone || ""}
                  onChange={(value) => handleFieldChangeShipping("phone", value)}
                />
                <TextField
                  type="text"
                  label="Province"
                  value={shippingDetails.province}
                  onChange={(value) => handleFieldChangeShipping("province", value)}
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
                  value={shippingDetails.zip}
                  onChange={(value) => handleFieldChangeShipping("zip", value)}
                />
              </FormLayout.Group>
            </FormLayout>
          </Modal.Section>
        )}
      </Modal>
      {toastMarkup}
    </Frame>
  );
}
