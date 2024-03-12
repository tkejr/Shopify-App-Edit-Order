import { LegacyCard, EmptyState, Page } from "@shopify/polaris";
import {
  Form,
  FormLayout,
  Checkbox,
  TextField,
  Button,
  FooterHelp,
  Link,
  Toast,
  Layout,
  Frame,
} from "@shopify/polaris";
import { Accordion } from "../components/Accordion";

export default function FAQ() {
  
  return (
    <Frame>
      <Page title="FAQ" defaultWidth>
        {" "}
        <Layout>
        <Layout.Section>
          <Accordion></Accordion>
        </Layout.Section>
      </Layout>
        
      </Page>
      
    </Frame>
  );
}
