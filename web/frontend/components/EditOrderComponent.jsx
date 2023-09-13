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
  TextContainer,
  IndexTable,
  useIndexResourceState,
  SkeletonThumbnail,
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
  const handleError = () => {
    setError(!error);
  };

  useEffect(() => {
    //const line_items = useSelector((state) => state.line_items);

    if (orderId && orderName) {
      getLineItems();
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
      setErrorContent("There was an error adding the product to the order");
      handleError();
    }

    setReload(!reload);
    setStatus("success");
  };

  const [showProducts, setShowProducts] = useState(false);
  const changeAmount = async () => {
    if (quantity === originalQuantity) {
      setErrorContent("Please select a quantity that is different");
      handleError();
    } else if (originalQuantity === "0") {
      setErrorContent(
        "Cannot change the quantity of a product that was originally zero"
      );
      handleError();
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
        setErrorContent("There was an error updating the quantity");
        handleError();
      }
      handleChangeQuantity();
      setReload(!reload);
      setStatus("success");
    }
  };
  const openQuantity = (id, quantity) => {
    handleId(id);
    //setFulfillable(quantity)
    setQuantity("" + quantity);
    setOriginalQuantity("" + quantity);

    handleChangeQuantity();
  };
  //
  const getLineItems = async () => {
    setStatus("loading");
    setProduct([]);
    setProductId("");
    setShowProducts(false);

    fetch("/api/lineItems/" + orderId)
      .then((response) => response.json())
      .then((json) => {
        setLineItems(json);
        console.log(json);

        setStatus("success");
      });
  };

  const [lineItemId, setLineItemId] = useState();
  const handleId = useCallback((value) => setLineItemId(value), []);

  //open modal
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => setActive(!active), [active]);
  //
  const [activeQuantity, setActiveQuantity] = useState(false);
  const handleChangeQuantity = useCallback(
    () => setActiveQuantity(!activeQuantity),
    [activeQuantity]
  );
  const [quantity, setQuantity] = useState("1");

  const handleQuantityChange = (number) => {
    if (number < 0) {
      setErrorContent("Quantity Must be atleast 0");
      handleError();
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

  return (
    <Frame>
      <Layout>
        <Layout.Section>
          <Card
            title={
              orderName
                ? `Order Details for Order ${orderName}`
                : "Pick an Order"
            }
          >
            <Card.Section>
              <Button disabled={!orderId} onClick={() => handleChange()}>
                {orderId ? "Add Product" : "Pick an Order"}
              </Button>
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

                    const media2 = (
                      <Thumbnail source={media} alt="placeholder" />
                    );

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
                            <Thumbnail
                              source={image}
                              alt="picture of product"
                            />
                          ) : (
                            <SkeletonThumbnail />
                          )
                        }
                      >
                        <div> {title}</div>
                      </ResourceList.Item>
                    );
                  }}
                />
              </Card.Section>
            )}
            {productId && (
              <Card.Section>
                <Button primary onClick={() => addProductVariant()}>
                  Add product
                </Button>
              </Card.Section>
            )}
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <ResourcePicker
            resourceType="Product"
            actionVerb="select"
            showVariants={false}
            selectMultiple={false}
            open={active}
            onSelection={(resources) => handleSelection(resources)}
            onCancel={() => console.log("cancelled")}
          />
        </Layout.Section>
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
      </Layout>
      {toastMarkup}
      <ErrorBanner open={error} onClose={handleError} content={errorContent} />
    </Frame>
  );
}
