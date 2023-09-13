import React, { useState, useEffect, useCallback } from "react";
import { Modal, TextContainer, SkeletonPage,Layout, Card, SkeletonBodyText, SkeletonDisplayText  } from "@shopify/polaris";

function CustomSkeletonPage() {
  

  return (
    <SkeletonPage fullWidth>
<Layout>
  <Layout.Section oneHalf>
    <Card sectioned>
      <SkeletonDisplayText size="small" />
      <SkeletonBodyText />
    </Card>
    <Card sectioned>
      <TextContainer>
        <SkeletonDisplayText size="small" />
        <SkeletonBodyText />
      </TextContainer>
    </Card>
    
  </Layout.Section>
  <Layout.Section oneHalf>
    
    <Card subdued>
      <Card.Section>
        <TextContainer>
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={2} />
        </TextContainer>
      </Card.Section>
      <Card.Section>
        <SkeletonBodyText lines={2} />
      </Card.Section>
    </Card>
  </Layout.Section>
</Layout>
</SkeletonPage>
  );
}

export default CustomSkeletonPage;



