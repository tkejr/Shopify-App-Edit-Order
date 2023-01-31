import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";

import { trophyImage } from "../assets";

import { ProductsCard, OrderTable, DatePickerExample } from "../components";

export default function HomePage() {
  const [show, setShow] = useState(false);
  const toggleShow = () => {
    if (!show) {
      setShow(true);
    }
  };
  const [orderId, setOrderId] = useState(0);
  const [orderName, setName] = useState();

  return (
    <Page narrowWidth>
      <TitleBar title="Editify" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <OrderTable
            toggleShow={toggleShow}
            setOrderId={setOrderId}
            setName={setName}
          />
        </Layout.Section>
        <Layout.Section>
          {show && (
            <DatePickerExample orderId={orderId} orderName={orderName} />
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
