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
  
  if(discountCodes.length > 0){
    //console.log('in here ===================', discountCodes)
    if(order?.discount_codes){
        //newOrder.discount_codes= order?.discount_codes;
       // console.log('========{{{{{}}}}}}}', newOrder.discount_codes, discountCodes)
       // newOrder.discount_codes.push(discountCodes[0]) ;
       newOrder.discount_codes = discountCodes;
        //console.log(newOrder.discount_codes)

    } 
     
  }
  
  else{
    //console.log("====== here in the discountCodes dont exist", discountCodes)
/*
    if(order?.discount_codes){
        newOrder.discount_codes= order?.discount_codes;

    }
    */
   ////new logic
   //console.log('in here 2 ===============', discountCodes)
   if(order?.discount_codes?.length === 1){
    if(order?.discount_codes[0].type === 'percentage'){
      
      let code = '';
      if(order.discount_codes[0].code === ''){
        code = 'Custom Discount'
      }
      else{
        code = order.discount_codes[0].code
      }
      let discount_code = [{code: code , amount: order.discount_codes[0].amount, type:'fixed_amount'}]
      
      newOrder.discount_codes = discount_code;
      
    } 
    else{
      let code = '';
      if(order.discount_codes[0].code === ''){
        code = 'Custom Discount'
      }
      else{
        code = order.discount_codes[0].code
      }
      let discount_code = [{code: code , amount: order.discount_codes[0].amount, type:'fixed_amount'}]
      
      newOrder.discount_codes = discount_code;
      //order2.discount_codes = orderTesting?.discount_codes;
    }
    
    
  }
  else{
    newOrder.current_total_discounts = order?.current_total_discounts;
    newOrder.current_total_discounts_set = order?.current_total_discounts_set;
    newOrder.discount_applications = order?.discount_applications; 
    newOrder.total_discounts = order?.total_discounts;
    newOrder.total_discounts_set = order?.total_discounts_set;
  }
  
  }
  
  if (order.financial_status === "paid") {
    newOrder.transactions = [
      {
        kind: "sale",
        status: "success",
        amount: parseFloat(order.total_price),
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
  
  
  
  newOrder.note = order.note;
  newOrder.note_attributes = order.note_attributes;
  //newOrder.total_tax = order.total_tax;
 //misc
  newOrder.total_weight = order.total_weight;
  //newOrder.payment_gateway_names = order.payment_gateway_names;
  newOrder.phone = order.phone;
  //newOrder.processing_method = order.processing_method;
  newOrder.referring_site = order.referring_site;
  newOrder.refunds = order.refunds;
  newOrder.cart_token = order.cart_token;
  newOrder.checkout_token = order.checkout_token;
  newOrder.client_details = order.client_details;
  newOrder.cancel_reason = order.cancel_reason;
  newOrder.cancelled_at = order.cancelled_at;
  newOrder.closed_at = order.closed_at;
  newOrder.company = order.company;
  newOrder.total_tip_received = order.total_tip_received;

  newOrder.taxes_included = order.taxes_included;
  newOrder.total_tax = order.total_tax;

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
    //cancel the old order
    //await order?.cancel({}); 
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
