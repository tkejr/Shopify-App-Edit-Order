import { DeliveryMethod } from "@shopify/shopify-api";
import Mixpanel from "mixpanel";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");
const SEND_GRID_API_KEY = process.env.EMAIL_API_KEY || "";
import sgMail from "@sendgrid/mail";
import { uninstallEmailHelper, emailHelper } from "./email-helper.js";
import shopify from "./shopify.js";
import { addUser, getUserIdByUrl, updateUserDetails } from "./db.js";

export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
      console.log(payload);
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },

  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks", // Set the path for your new webhook
    callback: async (topic, shop, body, webhookId) => {
      console.log("=== INSIDE UNINSTALL WEBHOOK ====");
      // Handle your new webhook here

      const shop_data = JSON.parse(body);
      console.log(shop_data);
      const shopEmail = shop_data.email;

      // Your webhook processing logic here

      //Send Email to us so we know uninstalled happen
      const Installmsg = {
        to: ["tanmaykejriwal28@gmail.com", "albertogaucin.ag@gmail.com"], // Change to your recipient
        from: "editifyshopify@gmail.com", // Change to your verified sender
        subject: `Fucking Hell - ${shop_data.name} Uninstalled`,
        text: `IMPROVE THE APP ALREADY`,
      };

      sgMail
        .send(Installmsg)
        .then(() => {
          console.log("Email sent to owners");
        })
        .catch((error) => {
          console.error(error);
        });

      //Log the uninstall in Mixpanel
      mixpanel.track("Uninstall", {
        distinct_id: shop_data.myshopify_domain,
      });

      //Send email to customers
      const uninstallMsg = await uninstallEmailHelper(shopEmail);
      sgMail
        .send(uninstallMsg)
        .then(() => {
          console.log("Email sent to customers");
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },

  APP_SUBSCRIPTIONS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log(shop);
      console.log("======= Inside App Subcription Update ========");
      const payload = JSON.parse(body);

      console.log(payload.app_subscription.status);

      mixpanel.track("Subscription Update", {
        distinct_id: shop,
        name: payload.app_subscription.name,
        status: payload.app_subscription.status,
        capped_amount: payload.app_subscription.capped_amount,
      });

      console.log("======= IN UPDATE SUBSCRIPTION ========= ");
      console.log(payload.app_subscription.status);

      if (payload.app_subscription.status == "ACTIVE") {
        try {
          console.log("======= ADDING USER ==============");
          user = await addUser(shop, "temp_access");

          //If added successfully means new user so send an email to user and owners

          const shopDetails = await shopify.api.rest.Shop.all({
            session: sess,
          });

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

          //send email to us
          const Installmsg = {
            to: ["tanmaykejriwal28@gmail.com", "albertogaucin.ag@gmail.com"], // Change to your recipient
            from: "editifyshopify@gmail.com", // Change to your verified sender
            subject: `LFG Ka-ching-$$  ${payload.app_subscription.name}`,
            text: `An Installation was made by ${shop} `,
          };

          sgMail
            .send(Installmsg)
            .then(() => {
              console.log("Email sent to owners");
            })
            .catch((error) => {
              console.error(error);
            });
        } catch {
          console.log("User already Exists");
        }

        //changing the plan in db
        const uid = await getUserIdByUrl(shop);
        const updatedUserDetails = await updateUserDetails(
          uid,
          undefined,
          undefined,
          undefined,
          undefined,
          payload.app_subscription.name
        );

        //send only on new install
      }
      console.log(payload);
    },
  },
};
