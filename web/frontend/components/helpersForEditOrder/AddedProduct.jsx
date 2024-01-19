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



const AddedProduct = (props)  =>{
  
  return (
    <LegacyCard.Section title="Product to be Added">
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={props.product}//
              renderItem={(item) => {
                const { id, title, url, images } = item;

                let image;
                let hasPicture = true;
                if (images[0]) {
                  image = images[0].originalSrc;
                } else {
                  hasPicture = false;
                }
                return (
                  <ResourceList.Item
                    id={id}
                    url={url}
                    media={
                      hasPicture ? (
                        <Thumbnail source={image} alt="picture of product" />
                      ) : (
                        <SkeletonThumbnail />
                      )
                    }
                  >
                    <div> {title}</div>
                    <div style={{ alignItems: "right", float: "right" }}>
                      <Button plain destructive onClick={() => props.removeProduct()}>
                        Remove
                      </Button>
                    </div>
                  </ResourceList.Item>
                );
              }}
            />
          </LegacyCard.Section>
  );
}

export default AddedProduct;