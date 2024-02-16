import express from "express";
import Mixpanel from "mixpanel";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");
import shopify from "../shopify.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    mixpanel.track("Invoice sent", {
      distinct_id: res.locals.shopify.session.shop,
    });
    const session = res.locals.shopify.session;
    const emailData = req.body.email;
    const orderId = req.body.orderId;

    const client = new shopify.api.clients.Graphql({ session });

    var data = await client.query({
      data: {
        query: `
                    mutation OrderInvoiceSend($orderId: ID!, $email: EmailInput) {
                    orderInvoiceSend(id: $orderId, email: $email) {
                        order {
                            id
                        }
                        userErrors {
                            message
                        }
                    }
                }`,
        variables: {
          orderId: `gid://shopify/Order/${orderId}`,
          email: {
            to: emailData.to,
            from: emailData.from,
            subject: emailData.subject,
            customMessage: emailData.customMessage,
          },
        },
      },
    });

    data = data.body.data.orderInvoiceSend;

    if (data && data.userErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: data.userErrors,
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice sent successfully",
      order: data.order,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;
