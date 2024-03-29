import express from "express";
import Mixpanel from "mixpanel";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");
import shopify from "../shopify.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  console.log("========== In get Billing =============");
  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "billing_address",
  });
  let returnObj = orderData.billing_address;
  console.log("======== shiping addy", orderData);
  if (!orderData.billing_address) {
    console.log("here, there is no billing addresss");
    returnObj = { status: "none" };
  }
  res.json(returnObj);
});

router.put("/:id", async (req, res) => {
  console.log("====== Inside Update Billing ========");
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const edited_billing = req.body;
  //@ts-ignore
  let status = 200;
  let error = null;
  //find old order
  const order = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
  });
  // Create new order with new stuff

  const newOrder = new shopify.api.rest.Order({ session: session });
  newOrder.line_items = order.line_items;

  edited_billing.name =
    edited_billing.first_name + " " + edited_billing.last_name;
  //need an if around this perhaps
  if (edited_billing) {
    newOrder.billing_address = edited_billing;
  }

  //name, address1 and 2, phone, province, city, zip, country, zip, why is name here again
  //this is the minimum needed for singapore
  if (
    edited_billing.address1 === "" ||
    edited_billing.country === "" ||
    edited_billing.zip === "" ||
    edited_billing.first_name === "" ||
    edited_billing.last_name === ""
  ) {
    status = 500;
    error = "Invalid billing address";
  }

  if (order.shipping_address == null) {
    console.log("in here", order.shipping_address);
    status = 501;
    error = "No shipping address in order";
  }

  if (JSON.stringify(order.customer) === "{}") {
    console.log("in here", order.shipping_address);
    status = 502;
    error = "No customer in order";
  }
  newOrder.shipping_address = order.shipping_address;
  //need to check that this exists

  //this is the list of financial status
  // authorized expired paid partially_paid partially_refunded pending refunded unpaid voided
  if (order.financial_status === "paid") {
    newOrder.transactions = [
      {
        kind: "sale",
        status: "success",
        amount: parseFloat(order.total_price),
      },
    ];
  } else {
    if (order.total_price - order.total_outstanding > 0) {
      newOrder.transactions = [
        {
          kind: "authorization",
          status: "success",
          amount: parseFloat(order.total_price - order.total_outstanding),
          //amount: parseFloat( order.total_outstanding),
        },
      ];
    }
  }

  newOrder.financial_status = order.financial_status;
  //newOrder.payment_terms = order.payment_terms;

  //for same number
  newOrder.order_number = order.order_number;
  newOrder.number = order.number;
  newOrder.name = order.name;
  newOrder.customer = order.customer;

  if (order.tags) {
    newOrder.tags = order.tags;
  }
  /*
  if(order.discount_codes){
    newOrder.discount_codes = order.discount_codes; 
  }
  */
  /////new logic
  if (order.discount_codes?.length === 1) {
    if (order.discount_codes[0].type === "percentage") {
      let code = "";
      if (order.discount_codes[0].code === "") {
        code = "Custom Discount";
      } else {
        code = order.discount_codes[0].code;
      }
      let discount_code = [
        {
          code: code,
          amount: order.discount_codes[0].amount,
          type: "fixed_amount",
        },
      ];

      newOrder.discount_codes = discount_code;
    } else {
      let code = "";
      if (order.discount_codes[0].code === "") {
        code = "Custom Discount";
      } else {
        code = order.discount_codes[0].code;
      }
      let discount_code = [
        {
          code: code,
          amount: order.discount_codes[0].amount,
          type: "fixed_amount",
        },
      ];

      newOrder.discount_codes = discount_code;
      //order2.discount_codes = orderTesting?.discount_codes;
    }
  } else {
    newOrder.current_total_discounts = order?.current_total_discounts;
    newOrder.current_total_discounts_set = order?.current_total_discounts_set;
    newOrder.discount_applications = order?.discount_applications;
    newOrder.total_discounts = order?.total_discounts;
    newOrder.total_discounts_set = order?.total_discounts_set;
  }
  if (order.email !== "") {
    newOrder.email = order.email;
  }

  newOrder.created_at = order.created_at;
  newOrder.processed_at = order.processed_at;
  //for notes
  newOrder.note = order.note;
  newOrder.total_tax = order.total_tax;
  newOrder.currency = order.currency;
  newOrder.note_attributes = order.note_attributes;

  newOrder.total_weight = order.total_weight;
  newOrder.cart_token = order.cart_token;
  newOrder.checkout_token = order.checkout_token;
  newOrder.client_details = order.client_details;
  newOrder.cancelled_at = order.cancelled_at;
  newOrder.cancel_reason = order.cancel_reason;
  newOrder.closed_at = order.closed_at;
  newOrder.company = order.company;
  //newOrder.payment_gateway_names = order.payment_gateway_names;
  newOrder.phone = order.phone;
  //newOrder.processing_method = order.processing_method;
  newOrder.referring_site = order.referring_site;
  newOrder.refunds = order.refunds;
  newOrder.total_tip_received = order.total_tip_received;

  newOrder.shipping_lines = order.shipping_lines; //need this

  /*
  newOrder.total_discounts = order.total_discounts;
  newOrder.total_discounts_set = order.total_discounts_set;
  newOrder.total_line_items_price = order.total_line_items_price;
  newOrder.total_line_items_price_set = order.total_line_items_price_set;
  newOrder.total_outstanding = order.total_outstanding;
  newOrder.total_price = order.total_price;

  newOrder.total_price_set = order.total_price_set;
  newOrder.total_shipping_price_set = order.total_shipping_price_set;
  */
  /*
  newOrder.total_tax_set = order.total_tax_set;
  newOrder.total_tip_received = order.total_tip_received;
  newOrder.total_weight = order.total_weight;
  newOrder.updated_at = order.updated_at; //
  newOrder.user_id = order.user_id; //

  
  
*/
  //newOrder.subtotal_price = order.subtotal_price;
  //newOrder.subtotal_price_set = order.subtotal_price_set;

  /*
  newOrder.current_total_price = order.current_total_price;
  newOrder.current_total_price_set = order.current_total_price_set;
  newOrder.current_total_tax = order.current_total_tax;
  newOrder.current_total_tax_set = order.current_total_tax_set;
*/

  /*
  newOrder.estimated_taxes = order.estimated_taxes;
  newOrder.gateway = order.gateway;
  newOrder.landing_site = order.landing_site;
  newOrder.location_id = order.location_id;
  newOrder.merchant_of_record_app_id = order.merchant_of_record_app_id;
*/

  //newOrder.order_status_url = order.order_status_url;
  //newOrder.original_total_duties_set = order.original_total_duties_set;

  // newOrder.source_identifier = order.source_identifier;
  //

  //console.log(newOrder)
  if (status < 500) {
    try {
      //saving the newly created order here
      // @ts-ignore
      await newOrder.save({
        update: true,
      });
      //cancel the old order
      //await order?.cancel({});
      await shopify.api.rest.Order.delete({
        session: res.locals.shopify.session,
        id: req.params["id"],
      });
    } catch (e) {
      console.log(`Failed to update billing:  ${e.message}`);
      status = 500;

      error = e.message;
    }

    res.status(status).send({ success: status === 200, error });
  } else {
    res.status(status).send({ success: status === 200, error });
  }
});

router.get("/shipping/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  console.log("========== In get Shipping =============");
  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "shipping_address",
  });
  let returnObj = orderData.shipping_address;
  console.log("======== shiping addy", orderData);
  if (!orderData.shipping_address) {
    console.log("here, there is no shipping addresss");
    returnObj = { status: "none" };
  }
  res.json(returnObj);
});

router.put("/shipping/:id", async (req, res) => {
  console.log("====== Inside Update Shipping ========");
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const edited_billing = req.body;
  const orderId = req.params["id"];
  let status = 200;
  let error;

  const order = new shopify.api.rest.Order({ session: session });
  order.id = orderId;
  edited_billing.name =
    edited_billing.first_name + " " + edited_billing.last_name;
  order.shipping_address = edited_billing;

  try {
    const updateOrder = await order.save({
      update: true,
    });
  } catch (e) {
    status = 500;
    error = e.message;
    console.log(e);
  }
  console.log("=====", status, error);
  res.status(status).send({ success: status === 200, error });
});

//new experimental one
router.put("/:taxesOff/:id", async (req, res) => {
  console.log("====== Inside Update Shipping test ========");
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const edited_billing = req.body;
  const orderId = req.params["id"];
  //const taxesOff = req.params["taxesOff"];
  let taxesOff;
  if (req.params["taxesOff"] === "false") {
    taxesOff = false;
  } else {
    taxesOff = true;
  }
  console.log(taxesOff);
  let status = 200;
  let error;

  //init orders
  const order = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
  });
  const newOrder = new shopify.api.rest.Order({ session: session });

  //change billing address
  edited_billing.name =
    edited_billing.first_name + " " + edited_billing.last_name;
  if (edited_billing) {
    newOrder.billing_address = edited_billing;
  }
  //need validation here
  //name, address1 and 2, phone, province, city, zip, country, zip, why is name here again
  //this is the minimum needed for singapore
  if (
    edited_billing.address1 === "" ||
    edited_billing.country === "" ||
    edited_billing.zip === "" ||
    edited_billing.first_name === "" ||
    edited_billing.last_name === ""
  ) {
    status = 500;
    error = "Invalid billing address";
  }
  if (order.shipping_address == null) {
    console.log("in here", order.shipping_address);
    status = 501;
    error = "No shipping address in order";
  }
  if (JSON.stringify(order.customer) === "{}") {
    console.log("in here", order.shipping_address);
    status = 502;
    error = "No customer in order";
  }
  newOrder.shipping_address = order.shipping_address;
  newOrder.customer = order.customer;
  //normal things
  newOrder.line_items = order.line_items;
  newOrder.currency = order.currency;
  if (order.email !== "") {
    newOrder.email = order.email;
  }
  if (order.tags) {
    newOrder.tags = order.tags;
  }
  newOrder.created_at = order.created_at;
  newOrder.processed_at = order.processed_at;

  newOrder.order_number = order.order_number;
  newOrder.number = order.number;
  newOrder.name = order.name;

  //for notes
  newOrder.note = order.note;
  newOrder.note_attributes = order.note_attributes;
  newOrder.total_weight = order.total_weight;
  newOrder.cart_token = order.cart_token;
  newOrder.checkout_token = order.checkout_token;
  newOrder.client_details = order.client_details;
  newOrder.cancelled_at = order.cancelled_at;
  newOrder.cancel_reason = order.cancel_reason;
  newOrder.closed_at = order.closed_at;
  newOrder.company = order.company;
  newOrder.phone = order.phone;
  newOrder.referring_site = order.referring_site;
  newOrder.refunds = order.refunds;
  newOrder.total_tip_received = order.total_tip_received;
  newOrder.shipping_lines = order.shipping_lines;

  newOrder.financial_status = order.financial_status;
  //console.log('==============', taxesOff)
  if (taxesOff && order.financial_status === "paid") {
    //console.log('in here djsfjksfkjkmk', taxesOff)
    newOrder.line_items.forEach((line_item) => {
      line_item.tax_lines = [];
    });
    console.log("in here dfdsfsdf", order.financial_status, taxesOff);
    if (order.financial_status === "paid") {
      newOrder.transactions = [
        {
          kind: "sale",
          status: "success",
          //amount: parseFloat(order.total_price - order.total_tax),
          amount: parseFloat(order.subtotal_price),
        },
      ];
    }

    //newOrder.total_price = order.subtotal_price;

    //newOrder.total_tax = order.total_tax;
    //newOrder.taxes_included = order.taxes_included;
    //newOrder.total_tax_set = order.total_tax_set;
    newOrder.tax_lines = order.tax_lines;
    //newOrder.current_total_price = order.subtotal_price;
    newOrder.taxes_included = true;
    /*
  if(order.tax_exemptions){
    newOrder.tax_exemptions; 
  }
  */
  } else {
    if (order.financial_status === "paid") {
      newOrder.transactions = [
        {
          kind: "sale",
          status: "success",
          amount: parseFloat(order.total_price),
        },
      ];
    } else {
      console.log("should be in here");
      if (order.total_price - order.total_outstanding > 0) {
        newOrder.transactions = [
          {
            kind: "authorization",
            status: "success",
            amount: parseFloat(order.total_price - order.total_outstanding),
          },
        ];
      }
    }

    newOrder.total_tax = order.total_tax;
    newOrder.total_price = order.total_price;
  }
  if (order.discount_codes?.length === 1) {
    if (order.discount_codes[0].type === "percentage") {
      let code = "";
      if (order.discount_codes[0].code === "") {
        code = "Custom Discount";
      } else {
        code = order.discount_codes[0].code;
      }
      let discount_code = [
        {
          code: code,
          amount: order.discount_codes[0].amount,
          type: "fixed_amount",
        },
      ];

      newOrder.discount_codes = discount_code;
    } else {
      let code = "";
      if (order.discount_codes[0].code === "") {
        code = "Custom Discount";
      } else {
        code = order.discount_codes[0].code;
      }
      let discount_code = [
        {
          code: code,
          amount: order.discount_codes[0].amount,
          type: "fixed_amount",
        },
      ];

      newOrder.discount_codes = discount_code;
      //order2.discount_codes = orderTesting?.discount_codes;
    }
  } else {
    newOrder.current_total_discounts = order?.current_total_discounts;
    newOrder.current_total_discounts_set = order?.current_total_discounts_set;
    newOrder.discount_applications = order?.discount_applications;
    newOrder.total_discounts = order?.total_discounts;
    newOrder.total_discounts_set = order?.total_discounts_set;
  }
  if (status < 500) {
    try {
      //saving the newly created order here
      // @ts-ignore

      await newOrder.save({
        update: true,
      });

      await shopify.api.rest.Order.delete({
        session: res.locals.shopify.session,
        id: req.params["id"],
      });
    } catch (e) {
      console.log(`Failed to update billing:  ${e.message}`);
      status = 500;

      error = e.message;
    }

    res.status(status).send({ success: status === 200, error });
  } else {
    res.status(status).send({ success: status === 200, error });
  }
});

router.get("/email/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;

  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "email",
  });

  res.json(orderData);
});

export default router;
