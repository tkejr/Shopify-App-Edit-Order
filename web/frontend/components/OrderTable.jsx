import {
  IndexTable,
  Card,
  Button,
  useIndexResourceState,
  Filters,
  Select,
  TextField,
} from "@shopify/polaris";
import React from "react";
import { useAppQuery } from "../hooks";
import { useState, useCallback } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { Spinner } from "@shopify/polaris";
import { Pagination } from "@shopify/polaris";

export function OrderTable(props) {
  const [value, setValue] = useState("#");
  const handleChange = (e) => {
    //convert input text to lower case
    var lowerCase = e.target.value.toLowerCase();
    setInputText(lowerCase);
  };
  let orders = [];
  const { data, status } = useAppQuery({
    url: `/api/orders`,
    reactQueryOptions: {
      refetchOnReconnect: false,
    },
  });
  if (status === "success") {
    console.log(data);
    orders = data.slice(0, 10);
  }

  const resourceName = {
    singular: "order",
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

  const orderClicked = (id, name) => {
    props.toggleShow();
    props.setOrderId(id);
    props.setName(name);
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
              orderClicked(id, name);
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

  return (
    <Card>
      <TextField
        label="Search orders"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      {status !== "success" ? (
        <Spinner accessibilityLabel="Spinner example" size="large" />
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
