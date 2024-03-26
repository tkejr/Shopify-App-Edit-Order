// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import bodyParser from "body-parser";
import Mixpanel from "mixpanel";
import nodemailer from "nodemailer";

import sgMail from "@sendgrid/mail";
import { emailHelper } from "./email-helper.js";
import { getFreeTrialDays } from "./free_trial_helper.js";
import { pushNotify } from "./push-notification.js";

import { updateUserDetails, getUserIdByUrl } from "./db.js";

import preferenceRoutes from "./routes/preferenceRoutes.js";
import cPortalRoutes from "./routes/cPortalRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import orderBillingRoutes from "./routes/orderBillingRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import sendInvoice from "./routes/sendInvoice.js";
import taxRoutes from "./routes/taxRoutes.js";
import unpaidRoutes from "./routes/unpaidRoutes.js";
//new for billing
import { billingConfig } from "./shopify.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

//ENV Logic
// Just add to your .env FILE
//  ENVIRONMENT = "dev"
// to make billing as test charge
const ENV = process.env.ENVIRONMENT || "prod";
var prod = true;
if (ENV !== "prod") {
  prod = false;
}

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");
const SEND_GRID_API_KEY = process.env.EMAIL_API_KEY || "";

sgMail.setApiKey(SEND_GRID_API_KEY);

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  //this is for if you want to check if they have paid beforehand, super easy
  // Request payment if required
  async (req, res, next) => {
    //sending email on install

    //const plans = Object.keys(billingConfig);
    const session = res.locals.shopify.session;

    // const url = session.shop;
    //const access_token = session.accessToken;

    //Tracking the install event
    
    const shopDetails = await shopify.api.rest.Shop.all({
      session: session,
    });
    console.log("=================shop details", shopDetails)
    //email

    if (prod) {
      
      mixpanel.people.set(session.shop, {
        $first_name: shopDetails.data[0].shop_owner,
        $created: shopDetails.data[0].created_at,
        $email: shopDetails.data[0].customer_email,
        $phone: shopDetails.data[0].phone,
        $country: shopDetails.data[0].country_name,
        $country_code: shopDetails.data[0].country_code,
        $city: shopDetails.data[0].city,
        $region: shopDetails.data[0].province,
        $zip: shopDetails.data[0].zip,
        $shopify_plan: shopDetails.data[0].plan_name,
        $eligibility: shopDetails.data[0].eligible_for_payments,
        plan: "free",
      }); 
      /*
      if (hasPayment) {
        mixpanel.people.set(session.shop, {
          plan: "premium",
        });
      }
      */

    
   
    }

    next();
  },
  // Load the app otherwise
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Verify the user has a plan

app.post("/api/email", async (req, res) => {
  const sess = res.locals.shopify.session;
  const url = sess.shop;
  const { name, email, message } = req.body;
  const feedbackMsg = {
    to: ["contact@shopvana.io"], // Change to your recipient "tanmaykejriwal28@gmail.com",
    from: "editifyshopify@gmail.com", // Change to your verified sender
    subject: `Feedback form has been submitted by ${name}`,
    text: `A feedback form was filled with feedbacl message ${message} and their email is ${email}`,
  };

  sgMail
    .send(feedbackMsg)
    .then(() => {
      console.log("Email sent to owners for feedback");
      res.sendStatus(200); // Send a 200 OK status response
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ message: "Failed to send email." }); // Send a 500 status response for server errors
    });
});

app.get("/api/check", async (req, res) => {
  const sess = res.locals.shopify.session;
  const url = sess.shop;
  const access_token = sess.accessToken;
  console.log("access token", access_token);
  
  const HAS_PAYMENTS_QUERY = `
  query appSubscription {  
    currentAppInstallation {
      activeSubscriptions {
            id
            name
            lineItems {
                  id
                  plan {
                    pricingDetails {
                      __typename
                      ... on AppUsagePricing {
                        terms
                        balanceUsed {
                          amount
                        }
                        cappedAmount {
                          amount
                        }
                      }
                    }
                  }
                }
            }
          }
      }
  `;

  const session = res.locals.shopify.session;

  const client = new shopify.api.clients.Graphql({ session });
  let subscriptionLineItem = {};
  let hasPayment;
  
  //hardcoding the shop urls
  if (
    url == "sapinca-lt.myshopify.com" ||
    url == "kippah-falls-direct.myshopify.com" ||
    url == "shop.concular.de"
  ) {
    hasPayment = "pro";
    res.json({ hasPayment });
    return;
  }
  //const planName = Object.keys(billingConfig)[0];

  //const planDescription = billingConfig[planName].usageTerms;

  try {
    const response = await client.query({
      data: {
        query: HAS_PAYMENTS_QUERY,
      },
    });

    response.body.data.currentAppInstallation.activeSubscriptions.forEach(
      (subscription) => {
        if (subscription.name === "Editify Pro Plan") {
          hasPayment = "pro";
          /*
          subscription.lineItems.forEach((lineItem) => {
            if (lineItem.plan.pricingDetails.terms === planDescription) {
              subscriptionLineItem = {
                id: lineItem.id,
                balanceUsed: parseFloat(
                  lineItem.plan.pricingDetails.balanceUsed.amount
                ),
                cappedAmount: parseFloat(
                  lineItem.plan.pricingDetails.cappedAmount.amount
                ),
              };
            }
          });
          */
        } else if (subscription.name === "Editify Starter Plan") {
          hasPayment = "starter";
        } else if (subscription.name === "Editify Starter Annual Plan") {
          hasPayment = "starterAnnual";
        } else if (subscription.name === "Editify Pro Annual Plan") {
          hasPayment = "proAnnual";
        }
      }
    );
  } catch (error) {
    if (error) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
  
  res.json({ hasPayment });
});

app.get("/api/getFreeDays", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  const freedays = await getFreeTrialDays(shop);

  res.status(200).json(freedays);
});

app.get("/api/upgradePro", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  const freedays = await getFreeTrialDays(shop);
  ///IMPORTANT, change this to just /editify in prod
  var url = "https://" + shop + "/admin/apps/editify-dev";
  if (prod) {
    url = "https://" + shop + "/admin/apps/editify";
  }
  const recurring_application_charge =
    new shopify.api.rest.RecurringApplicationCharge({ session: session });
  recurring_application_charge.name = "Editify Pro Plan";
  recurring_application_charge.price = 9.99;
  recurring_application_charge.return_url = url;
  //recurring_application_charge.billing_account_id = 770125316;
  recurring_application_charge.trial_days = freedays;
  recurring_application_charge.test = !prod;
  await recurring_application_charge.save({
    update: true,
  });
  const confirmationUrl = recurring_application_charge.confirmation_url;
  //for testing if the user actually clicked on approvexs
  res.json({ confirmationUrl });
});

app.get("/api/upgradeStarter", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  const freedays = await getFreeTrialDays(shop);
  console.log("========Free days========");
  console.log(freedays);
  ///IMPORTANT, change this to just /editify in prod
  var url = "https://" + shop + "/admin/apps/editify-dev";
  if (prod) {
    url = "https://" + shop + "/admin/apps/editify";
  }
  const recurring_application_charge =
    new shopify.api.rest.RecurringApplicationCharge({ session: session });
  recurring_application_charge.name = "Editify Starter Plan";
  recurring_application_charge.price = 4.99;
  recurring_application_charge.return_url = url;
  //recurring_application_charge.billing_account_id = 770125316;
  recurring_application_charge.trial_days = freedays;
  recurring_application_charge.test = !prod;
  await recurring_application_charge.save({
    update: true,
  });
  const confirmationUrl = recurring_application_charge.confirmation_url;

  res.json({ confirmationUrl });
});
app.get("/api/upgradeProAnnual", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  // const freedays = await getFreeTrialDays(shop);
  console.log("========Free days========");
  // console.log(freedays);
  ///IMPORTANT, change this to just /editify in prod
  var url = "https://" + shop + "/admin/apps/editify-dev";
  if (prod) {
    url = "https://" + shop + "/admin/apps/editify";
  }

  const client = new shopify.api.clients.Graphql({ session });
  const data = await client.query({
    data: {
      query: `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }`,
      variables: {
        name: "Editify Pro Annual Plan",
        returnUrl: url,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: {
                  amount: 99.99,
                  currencyCode: "USD",
                },
                interval: "ANNUAL",
              },
            },
          },
        ],
        test: !prod,
      },
    },
  });

  //console.log(data.body.data.appSubscriptionCreate.confirmationUrl)
  const confirmationUrl = data.body.data.appSubscriptionCreate.confirmationUrl;
  res.json({ confirmationUrl });
});
app.get("/api/upgradeStarterAnnual", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  // const freedays = await getFreeTrialDays(shop);
  console.log("========Free days========");
  // console.log(freedays);
  ///IMPORTANT, change this to just /editify in prod
  var url = "https://" + shop + "/admin/apps/editify-dev";
  if (prod) {
    url = "https://" + shop + "/admin/apps/editify";
  }

  const client = new shopify.api.clients.Graphql({ session });
  const data = await client.query({
    data: {
      query: `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }`,
      variables: {
        name: "Editify Starter Annual Plan",
        returnUrl: url,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: {
                  amount: 49.99,
                  currencyCode: "USD",
                },
                interval: "ANNUAL",
              },
            },
          },
        ],
        test: !prod,
      },
    },
  });

  //console.log(data.body.data.appSubscriptionCreate.confirmationUrl)
  const confirmationUrl = data.body.data.appSubscriptionCreate.confirmationUrl;
  res.json({ confirmationUrl });
});
app.get("/api/orders", async (_req, res) => {
  const data = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any",
    limit: 250, // new to make the limit 250 instead of 50
  });

  res.status(200).json(data);
});
//new for advanced search
app.get("/api/orders/:startDate/:endDate", async (_req, res) => {
  const data = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any",
    limit: 250, // new to make the limit 250 instead of 50
    processed_at_min: _req.params["startDate"],
    processed_at_max: _req.params["endDate"],
  });

  res.status(200).json(data);
});
app.get("/api/orders/unfulfilled/:startDate/:endDate", async (_req, res) => {
  const data = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any",
    limit: 250, // new to make the limit 250 instead of 50
    processed_at_min: _req.params["startDate"],
    processed_at_max: _req.params["endDate"],
    fulfillment_status: "unfulfilled",
  });

  res.status(200).json(data);
});
//getting unfulfilled orders
app.get("/api/orders/unfulfilled", async (_req, res) => {
  const data = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    //status: "unfulfilled",
    fulfillment_status: "unfulfilled",
    limit: 250,
  });

  res.status(200).json(data);
});
app.put("/api/orders/:id", async (_req, res) => {
  const uid = await getUserIdByUrl(res.locals.shopify.session.shop);
  const updatedUserDetails = await updateUserDetails(uid, undefined, 1);

  //old way to get order above, now we find the specific order by the id and use that to copy all of the contents over
  const orderTesting = await shopify.api.rest.Order.find({
    session: res.locals.shopify.session,
    id: _req.params["id"],
  });

  //here is the new order we are creating, appropro named order2
  const order2 = new shopify.api.rest.Order({
    session: res.locals.shopify.session,
  });
  //@ts-ignore
  let status = 200;
  let error = null;
  //order.id = _req.params["id"];
  const newDate = _req.body.date;

  ////
  // here is all of it lol
  //most important are these two obviously
  order2.created_at = newDate;
  order2.processed_at = newDate;
  ///

  if (orderTesting?.financial_status === "paid") {
    if (orderTesting?.total_price > 0) {
      order2.transactions = [
        {
          kind: "sale",
          status: "success",
          amount: parseFloat(orderTesting?.total_price),
        },
      ];
    } else {
      console.log("this is a free paid order");
    }
  } else {
    if (orderTesting.total_price - orderTesting.total_outstanding > 0) {
      order2.transactions = [
        {
          kind: "authorization",
          status: "success",
          amount: parseFloat(
            orderTesting.total_price - orderTesting.total_outstanding
          ),
        },
      ];
    }
  }
  order2.line_items = orderTesting?.line_items;
  //console.log(orderTesting?.line_items)
  /*
  order2.line_items.forEach((line_item) => {
    
    //line_item. = ; 
    line_item.fulfillment_service = 'manual';
    line_item.fulfillment_status = 'fulfilled';
    

  });
  console.log(order2.line_items)
  */
  order2.financial_status = orderTesting?.financial_status;
  order2.taxes_included = orderTesting?.taxes_included;
  order2.total_tax = orderTesting?.total_tax;
  //new
  // order2.fulfillment_status = orderTesting?.fulfillment_status;
  //order2.discount_applications = orderTesting?.discount_applications;
  //order2.fulfillments = []
  //

  if (orderTesting?.shipping_address == null) {
    //order2.shipping_address = {}
    status = 503;
    error = "s";
  } else {
    order2.shipping_address = orderTesting?.shipping_address;
  }
  console.log(order2.shipping_address);
  if (orderTesting?.billing_address == null) {
    status = 501;
    error = "s";
    //order2.billing_address = {first_name:"test", last_name:"editify", address1:"6029 Bridal", country:"Singapore", zip:"179399"}
  } else {
    order2.billing_address = orderTesting?.billing_address;
  }

  if (orderTesting.shipping_lines) {
    order2.shipping_lines = orderTesting?.shipping_lines;
  }

  if (JSON.stringify(orderTesting.customer) === "{}") {
    status = 502;
    error = "s";
    //order2.customer = {};
  } else {
    order2.customer = orderTesting?.customer;
  }

  if (orderTesting.tags) {
    order2.tags = orderTesting?.tags;
  }
  if (orderTesting.email) {
    order2.email = orderTesting?.email;
  }
  //console.log(orderTesting?.discount_codes[0].amount, orderTesting?.discount_codes)
  //console.log(orderTesting?.discount_codes)

  if (orderTesting?.discount_codes?.length === 1) {
    /*
    if (orderTesting?.discount_codes[0].type === "percentage") {
      let code = "";
      if (orderTesting.discount_codes[0].code === "") {
        code = "Custom Discount";
      } else {
        code = orderTesting.discount_codes[0].code;
      }
      let discount_code = [
        {
          code: code,
          amount: orderTesting.discount_codes[0].amount,
          type: "fixed_amount",
        },
      ];

      order2.discount_codes = discount_code;
    } else {
      let code = "";
      if (orderTesting.discount_codes[0].code === "") {
        code = "Custom Discount";
      } else {
        code = orderTesting.discount_codes[0].code;
      }
      let discount_code = [
        {
          code: code,
          amount: orderTesting.discount_codes[0].amount,
          type: "fixed_amount",
        },
      ];

      order2.discount_codes = discount_code;
      //order2.discount_codes = orderTesting?.discount_codes;
    }*/
    order2.current_total_discounts = orderTesting?.current_total_discounts;
    order2.current_total_discounts_set =
      orderTesting?.current_total_discounts_set;
    order2.discount_applications = orderTesting?.discount_applications;
    order2.total_discounts = orderTesting?.total_discounts;
    order2.total_discounts_set = orderTesting?.total_discounts_set;
  } else {
    order2.current_total_discounts = orderTesting?.current_total_discounts;
    order2.current_total_discounts_set =
      orderTesting?.current_total_discounts_set;
    order2.discount_applications = orderTesting?.discount_applications;
    order2.total_discounts = orderTesting?.total_discounts;
    order2.total_discounts_set = orderTesting?.total_discounts_set;
  }

  //number
  order2.name = orderTesting?.name;
  order2.note = orderTesting?.note;
  order2.note_attributes = orderTesting?.note_attributes;
  order2.number = orderTesting?.number; //
  order2.order_number = orderTesting?.order_number;

  //misc
  order2.refunds = orderTesting?.refunds;
  order2.cancel_reason = orderTesting?.cancel_reason;
  order2.client_details = orderTesting?.client_details;
  order2.buyer_accepts_marketing = orderTesting?.buyer_accepts_marketing;
  order2.cancelled_at = orderTesting?.cancelled_at;
  order2.closed_at = orderTesting?.closed_at;
  order2.total_weight = orderTesting?.total_weight;

  order2.phone = orderTesting?.phone;

  /*
  let fulfillments = await shopify.api.rest.Fulfillment.all({
    session: res.locals.shopify.session,
    id: _req.params["id"],
  });

  console.log(fulfillments)
  order2.fulfillments = fulfillments;
  */
  /*
  console.log("this is it", orderTesting?.fulfillments)
  console.log("this is it", orderTesting?.line_items)
  if(orderTesting?.fulfillments){
    orderTesting.fulfillments.forEach((fulfillment) => {
      fulfillment.created_at = newDate; 
    });
    order2.fulfillments = orderTesting.fulfillments;
  }
  */
  //console.log('fgdgdgfdg',orderTesting?.fulfillments[0].line_items)
  //console.log(order2)
  if (status < 500) {
    try {
      //saving the newly created order here
      // @ts-ignore

      await order2.save({
        update: true,
      });
      //console.log('dfsfsdf', order2.fulfillments)

      //console.log('hewwrwesfdsf', order2)
      /*
    order2.line_items.forEach((lineItem) => {
      lineItem.fulfillment_date = newDate; 
    });
    */
      //await orderTesting.save({update:true})
      //await orderTesting.cancel({})
      // deleting the old order with the old date

      await shopify.api.rest.Order.delete({
        session: res.locals.shopify.session,
        id: _req.params["id"],
      });
    } catch (e) {
      console.log(`Failed to create orders:  ${e.message}`);
      status = 500;

      if (prod) {
        mixpanel.track("Backdate Fail", {
          distinct_id: res.locals.shopify.session.shop,
          error: e.message,
        });
      }
      error = e.message;
    }
    if (prod) {
      mixpanel.track("Edited Order", {
        distinct_id: res.locals.shopify.session.shop,
        order_number: order2.order_number,
      });
    }
    res.status(status).send({ success: status === 200, error });
  } else {
    res.status(status).send({ success: status === 200, error });
  }
});
app.get("/api/orderName/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "name",
  });
  let returnObj = orderData.name;
  console.log("======== shiping addy", orderData);
  if (!orderData.name) {
    console.log("here, there is no order name");
    returnObj = "none";
  }
  res.json(returnObj);
});
//get the line items
app.get("/api/lineItems/:id", async (_req, res) => {
  if (prod) {
    mixpanel.track("EO Page Opened", {
      distinct_id: res.locals.shopify.session.shop,
      orderId: _req.params["id"],
    });
  }
  const data = await shopify.api.rest.Order.find({
    session: res.locals.shopify.session,
    id: _req.params["id"],
  });
  const lineItems = data?.line_items;
  //putting the pictures there
  for (let i = 0; i < lineItems?.length; i++) {
    try {
      const data1 = await shopify.api.rest.Image.all({
        session: res.locals.shopify.session,
        product_id: lineItems[i].product_id,
      });

      if (data1[0].src) {
        lineItems[i].media = data1[0].src;
      } else {
        lineItems[i].media = "";
      }
    } catch (e) {
      console.log(e.message);
      lineItems[i].media =
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=jpg&quality=90&v=1530129081";
    }
  }

  res.status(200).json(lineItems);
});

//edit the order quantity of a product
app.get("/api/changeAmount/:id/:lineItemId/:quantity", async (req, res) => {
  const uid = await getUserIdByUrl(res.locals.shopify.session.shop);
  const updatedUserDetails = await updateUserDetails(
    uid,
    undefined,
    undefined,
    1
  );

  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({ session });
  if (prod) {
    mixpanel.track("EO Amount Change Quantity", {
      distinct_id: res.locals.shopify.session.shop,
      orderId: req.params["id"],
    });
  }
  //get all the vars
  const orderId = req.params["id"];
  const lineItemId = req.params["lineItemId"];
  let status = 200;
  let error = null;
  const quantity = parseInt(req.params["quantity"]);

  console.log("==========staart of it")
  console.log(orderId, lineItemId, quantity)
  try {
    const openOrder = await client.query({
      data: {
        query: `mutation orderEditBegin($id: ID!) {
      orderEditBegin(id: $id) {
        calculatedOrder {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        variables: {
          id: "gid://shopify/Order/" + orderId,
        },
      },
    });

    console.log('this is the mutation response 1' , openOrder.body.data.orderEditBegin)//.calculatedOrder
    const calculatedOrderId =
      openOrder.body.data.orderEditBegin.calculatedOrder.id;
    console.log('order id', calculatedOrderId)
    //console.log("this is the line item if", lineItemId)
    const calculatedLineItem = "gid://shopify/CalculatedLineItem/" + lineItemId;
    console.log("=====calc line item",calculatedLineItem)
    const changeAmount = await client.query({
      data: {
        query: `mutation orderEditSetQuantity($id: ID!, $lineItemId: ID!, $quantity: Int!) {
        orderEditSetQuantity(id: $id, lineItemId: $lineItemId, quantity: $quantity) {
          calculatedLineItem {
            id
          }
          calculatedOrder {
            id
      addedLineItems(first: 5) {
        edges {
          node {
            id
            quantity
          }
        }
      }
          }
          userErrors {
            field
            message
          }
        }
      }`,
        variables: {
          id: calculatedOrderId,
          lineItemId: calculatedLineItem,
          quantity: quantity,
          //"restock": true
        },
      },
    });

    console.log('this is the mutation response 2' , changeAmount.body.data.orderEditSetQuantity)
    const commitChange = await client.query({
      data: {
        query: `mutation orderEditCommit($id: ID!) {
      orderEditCommit(id: $id) {
        order {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        variables: {
          id: calculatedOrderId,
          notifyCustomer: false,
          staffNote: "This change is from Editify",
        },
      },
    });
    console.log('this is the mutation response' , commitChange.body.data.orderEditCommit)
  } catch (e) {
    console.log(`Failed to edit quantity:  ${e.message}`);
    status = 500;
    error = e.message;
  }

  res.status(status).send({ success: status === 200, error });
});
//add a product to an order
app.get("/api/addProduct/:orderId/:productId", async (req, res) => {
  const uid = await getUserIdByUrl(res.locals.shopify.session.shop);
  const updatedUserDetails = await updateUserDetails(
    uid,
    undefined,
    undefined,
    1
  );

  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({ session });
  //get all the vars
  if (prod) {
    mixpanel.track("EO Add Product to Order", {
      distinct_id: res.locals.shopify.session.shop,
      orderId: req.params["orderId"],
      productId: req.params["productId"],
    });
  }

  let status = 200;
  let error = null;
  const orderId = req.params["orderId"];
  const productId = req.params["productId"];

  const productVariantId = "gid://shopify/ProductVariant/" + productId;
  try {
    const openOrder = await client.query({
      data: {
        query: `mutation orderEditBegin($id: ID!) {
      orderEditBegin(id: $id) {
        calculatedOrder {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        variables: {
          id: "gid://shopify/Order/" + orderId,
        },
      },
    });

    //console.log('this is the mutation response 1' , openOrder)//.calculatedOrder
    const calculatedOrderId =
      openOrder.body.data.orderEditBegin.calculatedOrder.id;
    //console.log('order id', calculatedOrderId)

    const addProduct = await client.query({
      data: {
        query: `mutation orderEditAddVariant($id: ID!, $quantity: Int!, $variantId: ID!) {
        orderEditAddVariant(id: $id, quantity: $quantity, variantId: $variantId) {
          calculatedLineItem {
            id
          }
          calculatedOrder {
           id
          }
          userErrors {
            field
            message
          }
        }
      }`,
        variables: {
          id: calculatedOrderId,
          variantId: productVariantId,
          quantity: 1,
          //"restock": true
        },
      },
    });
    // console.log('this is the mutation response 2' , addProduct)
    const commitChange = await client.query({
      data: {
        query: `mutation orderEditCommit($id: ID!) {
      orderEditCommit(id: $id) {
        order { 
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        variables: {
          id: calculatedOrderId,
          notifyCustomer: false,
          staffNote: "This change is from Editify",
        },
      },
    });
    //console.log('this is the mutation response' , commitChange.body.data.orderEditCommit)
  } catch (e) {
    console.log(`Failed to edit order:  ${e.message}`);
    status = 500;
    error = e.message;
  }

  res.status(status).send({ success: status === 200, error });
});
//add a line item discount
app.post(
  "/api/addLineItemDiscount/:id/:lineItemId/:amount/:description/:code",
  async (req, res) => {
    const uid = await getUserIdByUrl(res.locals.shopify.session.shop);
    const updatedUserDetails = await updateUserDetails(
      uid,
      undefined,
      undefined,
      1
    );

    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({ session });
    if (prod) {
      mixpanel.track("EO Add Line item discount", {
        distinct_id: res.locals.shopify.session.shop,
        orderId: req.params["id"],
      });
    }
    //get all the vars
    const orderId = req.params["id"];
    const lineItemId = req.params["lineItemId"];
    let status = 200;
    let error = null;
    const amountOfDiscount = parseFloat(req.params["amount"]);
    const description = req.params["description"];
    const currencyCode = req.params["code"];

    try {
      const openOrder = await client.query({
        data: {
          query: `mutation orderEditBegin($id: ID!) {
      orderEditBegin(id: $id) {
        calculatedOrder {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
          variables: {
            id: "gid://shopify/Order/" + orderId,
          },
        },
      });

      //console.log('this is the mutation response 1' , openOrder.body.data.orderEditBegin)//.calculatedOrder
      const calculatedOrderId =
        openOrder.body.data.orderEditBegin.calculatedOrder.id;

      //console.log("this is the line item if", lineItemId)
      const calculatedLineItem =
        "gid://shopify/CalculatedLineItem/" + lineItemId;

      const addLineItemDiscount = await client.query({
        data: {
          query: `mutation orderEditAddLineItemDiscount($discount: OrderEditAppliedDiscountInput!, $id: ID!, $lineItemId: ID!) {
          orderEditAddLineItemDiscount(discount: $discount, id: $id, lineItemId: $lineItemId) {
            addedDiscountStagedChange {
              id
            }
            calculatedLineItem {
              id
             
            }
            calculatedOrder {
              id
              addedLineItems(first: 5) {
                edges {
                  node {
                    id
                    title
                    quantity
                    calculatedDiscountAllocations {
                      discountApplication {
                        id
                        description
                      }
                    }
                  }
                }
              }
              addedDiscountApplications(first: 5) {
                edges {
                  node {
                    id
                    description
                  }
                }
              }
            }
           
            userErrors {
              field
              message
            }
          }
        }`,
          variables: {
            id: calculatedOrderId,
            lineItemId: calculatedLineItem,
            discount: {
              description: description,
              fixedValue: {
                amount: amountOfDiscount,
                currencyCode: currencyCode,
              },
              //"percentValue": 1.1
            },
            //"restock": true
          },
        },
      });
      //console.log('========', addLineItemDiscount.body.data.orderEditAddLineItemDiscount.calculatedOrder.addedDiscountApplications)
      //const addedDiscountStagedChange = addLineItemDiscount.body.data.orderEditAddLineItemDiscount.addedDiscountStagedChange.id;
      //const addedDiscountApplications = addLineItemDiscount.body.data.orderEditAddLineItemDiscount.calculatedOrder.addedDiscountApplications;

      // console.log('this is the mutation response 2' , changeAmount.body.data.orderEditSetQuantity)
      const commitChange = await client.query({
        data: {
          query: `mutation orderEditCommit($id: ID!) {
      orderEditCommit(id: $id) {
        order {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
          variables: {
            id: calculatedOrderId,
            notifyCustomer: false,
            staffNote: "",
          },
        },
      });
      //console.log('this is the mutation response' , commitChange.body.data.orderEditCommit)
    } catch (e) {
      console.log(`Failed to add line item discount:  ${e.message}`);
      status = 500;
      error = e.message;
    }

    res.status(status).send({ success: status === 200, error });
  }
);

app.post("/api/addCustomItem/:id/:title/:amount/:code", async (req, res) => {
  const uid = await getUserIdByUrl(res.locals.shopify.session.shop);
  const updatedUserDetails = await updateUserDetails(
    uid,
    undefined,
    undefined,
    1
  );

  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({ session });
  if (prod) {
    mixpanel.track("Custom Item Added", {
      distinct_id: res.locals.shopify.session.shop,
      orderId: req.params["id"],
    });
  }
  //get all the vars
  const orderId = req.params["id"];
  const title = req.params["title"];
  let status = 200;
  let error = null;
  const amount = parseFloat(req.params["amount"]);
  const currencyCode = req.params["code"];
  try {
    const openOrder = await client.query({
      data: {
        query: `mutation orderEditBegin($id: ID!) {
      orderEditBegin(id: $id) {
        calculatedOrder {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        variables: {
          id: "gid://shopify/Order/" + orderId,
        },
      },
    });

    //console.log('this is the mutation response 1' , openOrder.body.data.orderEditBegin)//.calculatedOrder
    const calculatedOrderId =
      openOrder.body.data.orderEditBegin.calculatedOrder.id;
    console.log("order id", calculatedOrderId);
    //console.log("this is the line item if", lineItemId)
    // const calculatedLineItem = "gid://shopify/CalculatedLineItem/" + lineItemId;

    const addCustomItem = await client.query({
      data: {
        query: `mutation orderEditAddCustomItem($id: ID!, $price: MoneyInput!, $quantity: Int!, $title: String!) {
          orderEditAddCustomItem(id: $id, price: $price, quantity: $quantity, title: $title) {
            calculatedLineItem {
              id
            }
            calculatedOrder {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: {
          id: calculatedOrderId,

          locationId: "",
          price: {
            amount: amount,
            currencyCode: currencyCode,
          },
          quantity: 1,
          requiresShipping: false,
          taxable: true,
          title: title,
        },
      },
    });

    // console.log('this is the mutation response 2' , changeAmount.body.data.orderEditSetQuantity)
    const commitChange = await client.query({
      data: {
        query: `mutation orderEditCommit($id: ID!) {
      orderEditCommit(id: $id) {
        order {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        variables: {
          id: calculatedOrderId,
          notifyCustomer: false,
          staffNote: "",
        },
      },
    });
  } catch (e) {
    console.log(`Failed to add custom item:  ${e.message}`);
    status = 500;
    error = e.message;
  }

  res.status(status).send({ success: status === 200, error });
});
//Order Billing routes
app.use("/api/orderBilling", orderBillingRoutes);

//customer portal preferences
app.use("/api/preferences", preferenceRoutes);

//shipping
app.use("/api/shipping", shippingRoutes);

//tax routes 
app.use("/api/tax", taxRoutes);

//misc cportal routes
app.use("/api", cPortalRoutes);

//analytics routes
app.use("/api/analytics", analyticsRoutes);

//send Invoice
app.use("/api/sendInvoice", sendInvoice);

//Order discount routes
app.use("/api/discount", discountRoutes);

app.use("/api/unpaid", unpaidRoutes);

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
