import {
  BillingInterval,
  LATEST_API_VERSION,
  BillingReplacementBehavior,
} from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-01";

const DB_PATH = `${process.cwd()}/database.sqlite`;

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
export const billingConfig = {
  "Editify Starter Plan": {
    //
    amount: 3.99,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 3,
    usageTerms: "3 day free trial, then 4.99 per month",
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
  },
  "Editify Pro Plan": {
    //
    amount: 9.99,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 3,
    usageTerms: "3 day free trail, then 9.99 per month",
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: billingConfig, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
});

export default shopify;
