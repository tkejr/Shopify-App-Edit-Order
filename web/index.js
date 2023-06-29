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

//new for billing
import { billingConfig } from "./shopify.js";
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  //this is for if you want to check if they have paid beforehand, super easy
  // Request payment if required
  async (req, res, next) => {
    const plans = Object.keys(billingConfig);
    const session = res.locals.shopify.session;
    console.log("Install callback", session.shop);
    //Tracking the install event
    mixpanel.people.set(session.shop, {
      $first_name: session.shop,
      $created: new Date().toISOString(),
      plan: "premium",
    });
    const hasPayment = await shopify.api.billing.check({
      session,
      plans: plans,
      isTest: false,
    });

    if (hasPayment) {
      next();
    } else {
      res.redirect(
        await shopify.api.billing.request({
          session,
          plan: plans[0],
          isTest: false,
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

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });

  res.status(200).send(countData);
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
  console.log("in the callback");
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
  console.log("sdsd", res.locals);
  const client = new shopify.api.clients.Graphql({ session });
  let subscriptionLineItem = {};
  let hasPayment = false;
  //const planName = Object.keys(billingConfig)[0];
  const planName = "Editify Plan";
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
        if (subscription.name === planName) {
          hasPayment = true;
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
  res.json({ hasPayment });
});
app.get("/api/upgradeFirst", async (req, res) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;
  ///IMPORTANT, change this to just /editify in prod
  const url = "https://" + shop + "/admin/apps/editify-dev/";
  const recurring_application_charge =
    new shopify.api.rest.RecurringApplicationCharge({ session: session });
  recurring_application_charge.name = "Editify Plan";
  recurring_application_charge.price = 3.99;
  recurring_application_charge.return_url = url;
  //recurring_application_charge.billing_account_id = 770125316;
  recurring_application_charge.trial_days = 5;
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

app.get("/api/downgrade", async (_req, res) => {
  const session = res.locals.shopify.session;
  const planName = "Editify Plan";
  const allSubscriptions =
    await shopify.api.rest.RecurringApplicationCharge.all({
      session: session,
    });
  //go through all of them to finf the right one, how would you know it is the right one? active and same name and 32665272321 as api client id
  try {
    allSubscriptions.forEach((subscription) => {
      if (subscription.name === planName && subscription.status === "active") {
        shopify.api.rest.RecurringApplicationCharge.delete({
          session: session,
          id: subscription.id,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }

  const shop = session.shop;
  const basicUrl = "https://" + shop + "/admin/apps/editify-dev";
  res.json({ basicUrl });
});

app.get("/api/orders", async (_req, res) => {
  const data = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any",
    limit: 250, // new to make the limit 250 instead of 50
  });

  /*
  ////count total number of orders

  const count = await shopify.api.rest.Order.count({
    session: res.locals.shopify.session,
    status: "any",
    
  });

  */

  res.status(200).json(data);
});

app.put("/api/orders/:id", async (_req, res) => {
  //const order = new shopify.api.rest.Order({
  //  session: res.locals.shopify.session,
  //});
  //old way to get order above, now we find the specific order by the id and use that to copy all of the contents over
  const orderTesting = await shopify.api.rest.Order.find({
    session: res.locals.shopify.session,
    id: _req.params["id"],
  });
  console.log("This is the order Id" + _req.params["id"]);
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
  order2.currency = orderTesting?.currency;
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
  order2.fulfillment_status = orderTesting?.fulfillment_status;
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
  order2.presentment_currency = orderTesting?.presentment_currency;
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

  
  
  if(orderTesting.tags){
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

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
