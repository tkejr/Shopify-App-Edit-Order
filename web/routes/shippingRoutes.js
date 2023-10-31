import express from "express";
import {
  updateUserPreference,
  getUserIdByUrl,
  getUserPreferences,
} from "../db.js";
import Mixpanel from "mixpanel";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");
import shopify from "../shopify.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  console.log("========== In Update Shipping =============");
  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "shipping_lines",
  });
  //orderData.shipping_lines
  res.json(orderData.shipping_lines);
});

router.get("/taxLines/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;

  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "tax_lines",
  });

  res.json(orderData.tax_lines);
});
router.put("/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const shipping_and_discount_info = req.body;
  const updated_shipping_lines = shipping_and_discount_info.shippingCostDetails;
  const discountCodes = shipping_and_discount_info.discount_codes; 
  
  console.log('=====', discountCodes, updated_shipping_lines)
  //console.log("========",updated_shipping_lines, shipping_and_tax_info)
  //const updated_tax_lines  = shipping_and_tax_info.taxLines;
  //console.log('==========',updated_tax_lines)
  /*
    const line_item_tax_lines = [{
       
        "rate": updated_tax_lines[0].rate,
        "title": updated_tax_lines[0].title
    },
    {
       
        "rate": updated_tax_lines[1].rate,
        "title": updated_tax_lines[1].title
    },
]
*/

  const orderId = req.params["id"];
  let status = 200;
  let error;
  const order = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
  });
  //console.log(order)
  const newOrder = new shopify.api.rest.Order({ session: session });
  //newOrder.shipping_lines = updated_shipping_lines;
  //set the values 
  if(updated_shipping_lines.length > 0){
    console.log('hetwds =====', updated_shipping_lines)
    newOrder.shipping_lines = [
        {
          title: "" + updated_shipping_lines[0]?.title,
          price: "" + updated_shipping_lines[0]?.price,
        },
      ];
  }
  else
  {
    //console.log('here in klkllkklkl')
    newOrder.shipping_lines = order?.shipping_lines
  }
  //console.log("======", discountCodes)
  if(discountCodes){
    newOrder.discount_codes = discountCodes; 
  }
  else{
    //console.log("====== here in the discountCodes dont exist", discountCodes)

    if(order?.discount_codes){
        newOrder.discount_codes= order?.discount_codes;

    }
  }
  
  if (order.financial_status === "paid") {
    newOrder.transactions = [
      {
        kind: "sale",
        status: "success",
        amount: parseFloat(order.total_price - order.total_discounts),
      },
    ];
  }else{
  
    if(order.total_price - order.total_outstanding > 0){
       
          newOrder.transactions = [
            {
              "kind": "authorization",
              "status": "success",
              "amount": parseFloat( order.total_price - order.total_outstanding)
            }
          ];
    }
   
  }

  //newOrder.tax_lines = updated_tax_lines;
  newOrder.line_items = order.line_items;
  
  if (order.tags) {
    newOrder.tags = order.tags;
  }
  if(order.email !== ''){
    newOrder.email = order.email;
  }
  
  newOrder.customer = order.customer;
  newOrder.billing_address = order.billing_address;
  newOrder.shipping_address = order.shipping_address;
  newOrder.order_number = order.order_number;
  newOrder.number = order.number;
  newOrder.name = order.name;
  newOrder.financial_status = 'partially_paid';
 
  newOrder.created_at = order.created_at;
  newOrder.processed_at = order.processed_at;
  if(order.payment_details)
  {
    newOrder.payment_details = order.payment_details;
  }
  
  
  newOrder.note = order.note;
  newOrder.total_tax = order.total_tax;
 //misc
  newOrder.total_weight = order.total_weight;

  newOrder.note_attributes = order.note_attributes;
  newOrder.payment_gateway_names = order.payment_gateway_names;
  newOrder.phone = order.phone;
  newOrder.processing_method = order.processing_method;
  newOrder.referring_site = order.referring_site;
  newOrder.refunds = order.refunds;
  newOrder.cart_token = order.cart_token;
  newOrder.checkout_token = order.checkout_token;
  newOrder.client_details = order.client_details;
  newOrder.closed_at = order.closed_at;
  newOrder.company = order.company;
  newOrder.total_tip_received = order.total_tip_received;
 //newOrder.total_discounts = order.total_discounts;
 // newOrder.total_discounts_set = order.total_discounts_set;
 
  //newOrder.total_outstanding = order.total_outstanding;
  //newOrder.total_price = order.total_price;

  //newOrder.total_price_set = order.total_price_set;
 // newOrder.total_shipping_price_set = order.total_shipping_price_set;
 
 // newOrder.total_tax_set = order.total_tax_set;
  
  
 // newOrder.updated_at = order.updated_at; //
  //newOrder.user_id = order.user_id; //

  
  
 
  
 
  /*
    
  order.shipping_lines=  [
    {
        //"id": 2824129971363,
        "title": "UPS® Ground",
        "price": "11.13",
        //"code": "03",
        //"source": "ups_shipping"
    }
]

order.tax_lines =  [
    {
      "price": 13.5,
      "rate": 0.06,
      "title": "State tax"
    }
  ]
  */

  try {
    await newOrder.save({
      update: true,
    });

    await shopify.api.rest.Order.delete({
      session: res.locals.shopify.session,
      id: req.params["id"],
    });
  } catch (e) {
    status = 500;
    error = e.message;
    console.log(e);
  }
  console.log("=====", status, error);
  res.status(status).send({ success: status === 200, error });
});

export default router;
