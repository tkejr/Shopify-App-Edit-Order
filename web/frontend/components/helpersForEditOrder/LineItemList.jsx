import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextContainer,
  Banner,
  Button,
  LegacyCard,
  ResourceList,
  SkeletonThumbnail,
  Thumbnail,

} from "@shopify/polaris";
import { CircleTickMajor, CircleCancelMajor } from "@shopify/polaris-icons";


const LineItemList = (props)  =>{
  
  return (
    <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={props.line_items}
              renderItem={(item) => {
                const {
                  id,
                  url,
                  name,
                  sku,
                  price,
                  media,
                  fulfillable_quantity,
                  product_id,
                  price_set,
                } = item;
               
                
                const media2 = <Thumbnail source={media} alt="placeholder" />;

                return (
                  <ResourceList.Item
                    id={id}
                    url={url}
                    media={media2}
                    accessibilityLabel={`View details for ${name}`}
                  >
                    <div> {name}</div> 
                    <div>
                      Price: {price} {price_set.shop_money.currency_code} 
                    </div>
                    <div>SKU: {sku}</div>
                    <div>x{fulfillable_quantity} unfulfilled </div>
                    <Button
                      plain
                      onClick={() => props.openQuantity(id, fulfillable_quantity)}
                    >
                      Adjust Quantity
                    </Button>
                    <Button
                      plain
                      onClick={() => props.openLineItemDiscounts(id,price_set.shop_money.currency_code )}
                    >
                      Add Line Item discount
                    </Button>
                    <br></br>
                    
                    <br></br>
                  </ResourceList.Item>
                );
              }}
            />
  );
}

export default LineItemList;