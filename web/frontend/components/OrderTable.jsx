import {
  IndexTable,
  Card,
  Button,
  useIndexResourceState,
} from "@shopify/polaris";
import React from "react";
import { useAppQuery } from "../hooks";
import { useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

export function OrderTable(props) {
  const [orderData, setData] = useState([]);
  const fetch = useAuthenticatedFetch();
  let orders = [];
  const { data, status } = useAppQuery({
    url: `/api/orders`,
    reactQueryOptions: {
      refetchOnReconnect: false,
    },
  });
  if (status === "success") {
    console.log(data);
    orders = data;
  }

  const resourceName = {
    singular: "orders",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  const ConvertDate = (date) => {
    const dateObj = new Date(date);
    const options = { month: "long", day: "numeric", year: "numeric" };
    const convertedDate = dateObj.toLocaleDateString("en-US", options);
    return convertedDate;
  };

  const orderClicked = (id) => {
    props.toggleShow();
    props.setOrderId(id);
  };
  const rowMarkup = orders.map(
    ({ name, processed_at, customer, total_price, id }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(name)}
        position={index}
      >
        <IndexTable.Cell>
          <Button
            dataPrimaryLink
            onClick={() => {
              orderClicked(id);
            }}
          >
            {name}
          </Button>
        </IndexTable.Cell>
        <IndexTable.Cell>{ConvertDate(processed_at)}</IndexTable.Cell>

        <IndexTable.Cell>{customer.first_name}</IndexTable.Cell>
        <IndexTable.Cell>{total_price}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  // const getAllOrders = () => {
  //   const response = fetch("/api/orders").then((res) => res.json());
  //   //order data
  //   setData(response);
  //   console.log(orderData);
  //   console.log("WORKS");
  // };

  return (
    <Card>
      {status !== "success" ? (
        <div>Loading</div>
      ) : (
        <IndexTable
          resourceName={resourceName}
          itemCount={orders.length}
          selectable={false}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Name" },
            { title: "Date" },
            { title: "Customer Name" },
            { title: "Amount spent" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      )}
    </Card>
  );
}
