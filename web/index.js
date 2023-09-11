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

import {
  updateUserPreference,
  updateUserDetails,
  getUserIdByUrl,
} from "./db.js";

import { addUser } from "./db.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import cPortalRoutes from "./routes/cPortalRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

//new for billing
import { billingConfig } from "./shopify.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

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

    const plans = Object.keys(billingConfig);
    const session = res.locals.shopify.session;
    console.log("Install callback", session.shop);

    const url = session.shop;
    const access_token = session.accessToken;
    //Tracking the install event

    const shopDetails = await shopify.api.rest.Shop.all({
      session: session,
    });
    //email
    const shopEmail = "" + shopDetails[0].email;
    const msg = await emailHelper(shopEmail);
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    const hasPayment = await shopify.api.billing.check({
      session,
      plans: plans,
      isTest: true,
    });
    mixpanel.people.set(session.shop, {
      $first_name: shopDetails[0].shop_owner,
      $created: shopDetails[0].created_at,
      $email: shopDetails[0].customer_email,
      $phone: shopDetails[0].phone,
      $country: shopDetails[0].country_name,
      $country_code: shopDetails[0].country_code,
      $city: shopDetails[0].city,
      $region: shopDetails[0].province,
      $zip: shopDetails[0].zip,
      $shopify_plan: shopDetails[0].plan_name,
      $eligibility: shopDetails[0].eligible_for_payments,
      plan: "free",
    });

    if (hasPayment) {
      mixpanel.people.set(session.shop, {
        plan: "premium",
      });
    }

    if (hasPayment) {
      next();
    } else {
      res.redirect(
        await shopify.api.billing.request({
          session,
          plan: plans[1],
          isTest: true,
        })
      );
    }
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

app.get("/api/email", async (_req, res) => {
  const shopDetails = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });

  sgMail.setApiKey(
    "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"
  );
  const shopEmail = "" + shopDetails[0].email;
  try {
    // Send the email

    const msg = {
      to: shopEmail, // Change to your recipient
      from: "editifyshopify@gmail.com", // Change to your verified sender
      subject: "Editify",
      text: "Welcome to Editify",
      html: `
      <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
            <tr>
              <td align="center" style="padding:40px 0 30px 0;background:#ffffff;">
                <img src="https://cdn.shopify.com/app-store/listing_images/bf5dc60d84716ebd5705f5fbd4e12e90/icon/CJ3q_YWkjoADEAE=.png" alt="" width="300" style="height:auto;display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:36px 30px 42px 30px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                  <tr>
                    <td style="padding:0 0 36px 0;color:#153643;">
                      <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Welcome to Editify</h1>
                      <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Editify is one of the only apps on the Shopify App store to both offer a customer portal for customers to edit their orders and offer merchants a way to backdate their orders. As well as backdating, Editify lets you change just about everything else in an order. If you think there is something we missed, shoot us an email and we will work on implementing it! </p>
                      <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="https://apps.shopify.com/editify" style="color:#ee4c50;text-decoration:underline;">Write a Review</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0;">
                      <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                        <tr>
                          <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
                            <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><img src="https://assets.codepen.io/210284/left.gif" alt="" width="260" style="height:auto;display:block;" /></p>
                            <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"> Save on returns! Have customers directly edit their order!</p>
                            <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;"></a></p>
                          </td>
                          <td style="width:20px;padding:0;font-size:0;line-height:0;">&nbsp;</td>
                          <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
                            <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><img src="https://assets.codepen.io/210284/right.gif" alt="" width="260" style="height:auto;display:block;" /></p>
                            <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Save time trying to backdate an order, with our app it is as simple as a click of a button!</p>
                            <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;"></a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;background:#ee4c50;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                  <tr>
                    <td style="padding:0;width:50%;" align="left">
                      <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;">
                        &reg; KejrTech 2023<br/><a href="http://www.example.com" style="color:#ffffff;text-decoration:underline;"></a>
                      </p>
                    </td>
                    <td style="padding:0;width:50%;" align="right">
                      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                        <tr>
                          <td style="padding:0 0 0 10px;width:38px;">
                            <a href="https://twitter.com/1_Day_Apps" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/tw_1.png" alt="Twitter" width="38" style="height:auto;display:block;border:0;" /></a>
                          </td>
                          
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
      `,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    // Return a success response
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    // Return an error response
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Failed to send email.", error: error.message });
  }
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});
// Verify the user has a plan
app.get("/api/check", async (req, res) => {
  const sess = res.locals.shopify.session;
  const url = sess.shop;
  const access_token = sess.accessToken;

  try {
    await addUser(url, access_token);
  } catch (error) {
    console.error("Error in API:", error);
  }

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
  //const planName = Object.keys(billingConfig)[0];

  //const planDescription = billingConfig[planName].usageTerms;

  try {
    const response = await client.query({
      data: {
        query: HAS_PAYMENTS_QUERY,
      },
    });
    console.log(
      response.body.data.currentAppInstallation.activeSubscriptions.lineItems
    );
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
        }
      }
    );
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
  //return subscriptionLineItem;
  const shopDetails = await shopify.api.rest.Shop.all({
    session: session,
  });
  console.log(shopDetails);
  mixpanel.people.set(session.shop, {
    $first_name: shopDetails[0].shop_owner,
    $created: shopDetails[0].created_at,
    $email: shopDetails[0].customer_email,
    $phone: shopDetails[0].phone,
    $country: shopDetails[0].country_name,
    $country_code: shopDetails[0].country_code,
    $city: shopDetails[0].city,
    $region: shopDetails[0].province,
    $zip: shopDetails[0].zip,
    $shopify_plan: shopDetails[0].plan_name,
    $eligibility: shopDetails[0].eligible_for_payments,
    plan: "free",
  });

  if (hasPayment) {
    mixpanel.people.set(session.shop, {
      plan: "premium",
    });
  }
  res.json({ hasPayment });
});
app.get("/api/upgradePro", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  ///IMPORTANT, change this to just /editify in prod
  const url = "https://" + shop + "/admin/apps/editify/";
  const recurring_application_charge =
    new shopify.api.rest.RecurringApplicationCharge({ session: session });
  recurring_application_charge.name = "Editify Pro Plan";
  recurring_application_charge.price = 9.99;
  recurring_application_charge.return_url = url;
  //recurring_application_charge.billing_account_id = 770125316;
  recurring_application_charge.trial_days = 3;
  recurring_application_charge.test = true;
  await recurring_application_charge.save({
    update: true,
  });
  const confirmationUrl = recurring_application_charge.confirmation_url;

  mixpanel.track("Approved Charge", {
    distinct_id: shop,
    price: recurring_application_charge.price,
  });
  res.json({ confirmationUrl });
});
app.get("/api/upgradeStarter", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  ///IMPORTANT, change this to just /editify in prod
  const url = "https://" + shop + "/admin/apps/editify/";
  const recurring_application_charge =
    new shopify.api.rest.RecurringApplicationCharge({ session: session });
  recurring_application_charge.name = "Editify Starter Plan";
  recurring_application_charge.price = 4.99;
  recurring_application_charge.return_url = url;
  //recurring_application_charge.billing_account_id = 770125316;
  recurring_application_charge.trial_days = 3;
  recurring_application_charge.test = true;
  await recurring_application_charge.save({
    update: true,
  });
  const confirmationUrl = recurring_application_charge.confirmation_url;

  mixpanel.track("Approved Charge", {
    distinct_id: shop,
    price: recurring_application_charge.price,
  });
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

  //const order = new shopify.api.rest.Order({
  //  session: res.locals.shopify.session,
  //});
  //old way to get order above, now we find the specific order by the id and use that to copy all of the contents over
  const orderTesting = await shopify.api.rest.Order.find({
    session: res.locals.shopify.session,
    id: _req.params["id"],
  });

  //here is the new order we are creating, appropro named order2
  let order2 = new shopify.api.rest.Order({
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
  order2.line_items = orderTesting?.line_items;
  order2.transactions = orderTesting?.transactions;
  order2.total_tax = orderTesting?.total_tax;
  order2.billing_address = orderTesting?.billing_address;
  order2.app_id = orderTesting?.app_id;
  order2.cancel_reason = orderTesting?.cancel_reason;
  order2.buyer_accepts_marketing = orderTesting?.buyer_accepts_marketing;
  order2.cancelled_at = orderTesting?.cancelled_at;
  //order2.currency = orderTesting?.currency;
  order2.cart_token = orderTesting?.cart_token;
  order2.checkout_token = orderTesting?.checkout_token;
  order2.client_details = orderTesting?.client_details;
  order2.closed_at = orderTesting?.closed_at;
  order2.company = orderTesting?.company;
  order2.current_subtotal_price = orderTesting?.current_subtotal_price;
  order2.current_subtotal_price_set = orderTesting?.current_subtotal_price_set;
  order2.current_total_discounts = orderTesting?.current_total_discounts;
  order2.current_total_discounts_set =
    orderTesting?.current_total_discounts_set;
  order2.current_total_duties_set = orderTesting?.current_total_duties_set;
  order2.current_total_price = orderTesting?.current_total_price;
  order2.current_total_price_set = orderTesting?.current_total_price_set;
  order2.current_total_tax = orderTesting?.current_total_tax;
  order2.current_total_tax_set = orderTesting?.current_total_tax_set;
  order2.customer = orderTesting?.customer;
  order2.customer_locale = orderTesting?.customer_locale;
  order2.discount_applications = orderTesting?.discount_applications;
  // order2.discount_codes = orderTesting?.discount_codes;
  order2.email = orderTesting?.email;
  order2.estimated_taxes = orderTesting?.estimated_taxes;
  order2.financial_status = orderTesting?.financial_status;
  //order2.fulfillment_status = orderTesting?.fulfillment_status;
  // order2.fulfillments = orderTesting?.fulfillments;
  order2.gateway = orderTesting?.gateway;
  order2.landing_site = orderTesting?.landing_site;
  order2.location_id = orderTesting?.location_id;
  order2.merchant_of_record_app_id = orderTesting?.merchant_of_record_app_id;
  order2.name = orderTesting?.name;
  order2.note = orderTesting?.note;
  order2.note_attributes = orderTesting?.note_attributes;
  order2.number = orderTesting?.number; //
  order2.order_number = orderTesting?.order_number; //
  order2.order_status_url = orderTesting?.order_status_url;
  order2.original_total_duties_set = orderTesting?.original_total_duties_set;
  order2.payment_details = orderTesting?.payment_details;
  order2.payment_gateway_names = orderTesting?.payment_gateway_names;
  order2.payment_terms = orderTesting?.payment_terms;
  order2.phone = orderTesting?.phone;
  //order2.presentment_currency = orderTesting?.presentment_currency;
  order2.processing_method = orderTesting?.processing_method;
  order2.referring_site = orderTesting?.referring_site;
  order2.refunds = orderTesting?.refunds;
  //order2.session = orderTesting?.session; //
  order2.shipping_address = orderTesting?.shipping_address;
  order2.shipping_lines = orderTesting?.shipping_lines;
  order2.source_identifier = orderTesting?.source_identifier;
  //order2.source_name = orderTesting?.source_name;
  //order2.source_url = orderTesting?.source_url; //
  order2.subtotal_price = orderTesting?.subtotal_price;
  order2.subtotal_price_set = orderTesting?.subtotal_price_set;

  if (orderTesting.tags) {
    order2.tags = orderTesting?.tags;
  }

  //you cannot have these two attributes for some reason
  //order2.tax_lines = orderTesting?.tax_lines;

  order2.taxes_included = orderTesting?.taxes_included;
  //order2.test = orderTesting?.test; //
  //order2.token = orderTesting?.token; //
  order2.total_discounts = orderTesting?.total_discounts;
  order2.total_discounts_set = orderTesting?.total_discounts_set;
  order2.total_line_items_price = orderTesting?.total_line_items_price;
  order2.total_line_items_price_set = orderTesting?.total_line_items_price_set;
  order2.total_outstanding = orderTesting?.total_outstanding;
  order2.total_price = orderTesting?.total_price;
  order2.total_price_set = orderTesting?.total_price_set;
  order2.total_shipping_price_set = orderTesting?.total_shipping_price_set;
  order2.total_tax = orderTesting?.total_tax;
  order2.total_tax_set = orderTesting?.total_tax_set;
  order2.total_tip_received = orderTesting?.total_tip_received;
  order2.total_weight = orderTesting?.total_weight;
  order2.updated_at = orderTesting?.updated_at; //
  order2.user_id = orderTesting?.user_id; //

  ////

  try {
    //saving the newly created order here
    // @ts-ignore
    await order2.save({
      update: true,
    });

    // deleting the old order with the old date
    await shopify.api.rest.Order.delete({
      session: res.locals.shopify.session,
      id: _req.params["id"],
    });
  } catch (e) {
    console.log(`Failed to create orders:  ${e.message}`);
    status = 500;
    error = e.message;
  }
  mixpanel.track("Edited Order", {
    distinct_id: res.locals.shopify.session.shop,
    order_number: order2.order_number,
  });
  res.status(status).send({ success: status === 200, error });
});

//get the line items
app.get("/api/lineItems/:id", async (_req, res) => {
  mixpanel.track("EO Page Opened", {
    distinct_id: res.locals.shopify.session.shop,
    orderId: _req.params["id"],
  });
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
  mixpanel.track("EO Amount Change Quantity", {
    distinct_id: res.locals.shopify.session.shop,
    orderId: req.params["id"],
  });
  //get all the vars
  const orderId = req.params["id"];
  const lineItemId = req.params["lineItemId"];
  let status = 200;
  let error = null;
  const quantity = parseInt(req.params["quantity"]);
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
    //console.log('order id', calculatedOrderId)
    //console.log("this is the line item if", lineItemId)
    const calculatedLineItem = "gid://shopify/CalculatedLineItem/" + lineItemId;

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
          staffNote: "This change is from Editify",
        },
      },
    });
    //console.log('this is the mutation response' , commitChange.body.data.orderEditCommit)
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
  mixpanel.track("EO Add Product to Order", {
    distinct_id: res.locals.shopify.session.shop,
    orderId: req.params["orderId"],
    productId: req.params["productId"],
  });

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

//customer portal preferences
app.use("/api/preferences", preferenceRoutes);

//misc cportal routes
app.use("/api", cPortalRoutes);

//anyltcis routes
app.use("/api/analytics", analyticsRoutes);

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
