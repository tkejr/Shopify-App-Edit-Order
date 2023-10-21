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

router.put("/:id/:lineItemId/:quantity", async (req, res) => {
    
    /*
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
    */
    //get all the vars

    console.log('in jherwer dfgdsg ====================')
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({ session });
    const order = await shopify.api.rest.Order.find({
        session: session,
        id: req.params["id"],
      });
    console.log(order)
    const newOrder = new shopify.api.rest.Order({
        session: res.locals.shopify.session,
      });

      newOrder.line_items = [
        {
          "title": "Big Brown Bear Boots",
          "price": 74.99,
          "grams": "1300",
          "quantity": 3,
        
          "tax_lines": [
            {
              "price": 13.5,
              "rate": 0.06,
              "title": "State tax"
            }
          ]
        }
      ];
      
     
      /*
      newOrder.discount_applications = [
            {
        target_type: 'line_item',
             type: 'manual',
             value: '5.0',
            value_type: 'fixed_amount',
            allocation_method: 'across',
           target_selection: 'all',
         title: 'bnbnbn',
             description: 'bnbnbn'
           }
          ];
          */
        newOrder.total_discounts_set = {
            shop_money : {
                amount: '5.00', currency_code: 'INR' 
            },
            presentment_money:{
                amount: '5.00', currency_code: 'INR' 
            }
        
        }
    newOrder.total_discounts = '5.00';

    newOrder.line_items[0].discount_allocations = [{
        amount:'7.00',
        amount_set:{
            shop_money : {
                amount: '7.00', currency_code: 'INR' 
            },
            presentment_money:{
                amount: '7.00', currency_code: 'INR' 
            }
        },
        discount_application_index: 0
    }]
    //newOrder.line_items = order.line_items
    //newOrder.line_items[1].total_discount = '3.00';
    //newOrder.line_items[1].total_discount_set.presentment_money.amount = '3.00';
    //newOrder.line_items[1].total_discount_set.shop_money.amount = '3.00';
    //order.line_items[1].total_discount_set.presentment_money = '3.00';
    console.log(order.line_items[0].total_discount_set.presentment_money.amount)
    console.log(order.line_items[0].total_discount_set.presentment_money.currency_code)
    console.log(order.line_items[0].discount_allocations)
     const orderId = req.params["id"];
    const lineItemId = req.params["lineItemId"];
    let status = 200;
    let error = null;
    const quantity = parseInt(req.params["quantity"]);
    try {
        await newOrder.save({
            update: true,
          });
        /*
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
     // console.log('order id', calculatedOrderId)
      //console.log("this is the line item if", lineItemId)
      const calculatedLineItem = "gid://shopify/CalculatedLineItem/" + lineItemId;
      const discount = {percentValue: 20, description: "Product offer at checkout"}
      const changeAmount = await client.query({
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
              }
              userErrors {
                field
                message
              }
            }
          }
          `,
          variables: {
            id: calculatedOrderId,
            lineItemId: calculatedLineItem,
            discount: discount,
            //"restock": true
          },
        },
      });
  
       //console.log('this is the mutation response 2' , changeAmount.body.data.orderEditAddLineItemDiscount)
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
      })*/
      //console.log('this is the mutation response' , commitChange.body.data.orderEditCommit)
    } catch (e) {
      console.log(`Failed to edit quantity:  ${e.message}`);
      status = 500;
      error = e.message;
    }
  
    res.status(status).send({ success: status === 200, error });
  });




export default router;
