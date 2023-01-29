import {
  IndexTable,
  Card,
  Button,
  useIndexResourceState,
} from "@shopify/polaris";
import React from "react";

export function OrderTable(props) {
  const customers = [
    {
      id: "3411",
      url: "customers/341",
      name: "Mae Jemison",
      location: "Decatur, USA",
      orders: 20,
      amountSpent: "$2,400",
    },
    {
      id: "2561",
      url: "customers/256",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      orders: 30,
      amountSpent: "$140",
    },
    {
      id: "2565",
      url: "customers/256",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      orders: 30,
      amountSpent: "$140",
    },
    {
      id: "2566",
      url: "customers/256",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      orders: 30,
      amountSpent: "$140",
    },
    {
      id: "2567",
      url: "customers/256",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      orders: 30,
      amountSpent: "$140",
    },
    {
      id: "2567",
      url: "customers/256",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      orders: 30,
      amountSpent: "$140",
    },
    {
      id: "2568",
      url: "customers/256",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      orders: 30,
      amountSpent: "$140",
    },
    {
      id: "2569",
      url: "customers/256",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      orders: 30,
      amountSpent: "$140",
    },
  ];
  const resourceName = {
    singular: "customer",
    plural: "customers",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(customers);

  const orderClicked = (id) => {
    props.toggleShow();
    console.log(id);
    props.setOrderId(id);
  };
  const rowMarkup = customers.map(
    ({ id, url, name, location, orders, amountSpent }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Button
            dataPrimaryLink
            url={url}
            onClick={() => {
              orderClicked(id);
            }}
          >
            {name}
          </Button>
        </IndexTable.Cell>
        <IndexTable.Cell>{location}</IndexTable.Cell>
        <IndexTable.Cell>{orders}</IndexTable.Cell>
        <IndexTable.Cell>{amountSpent}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  /* do not need to press a button, just fetches automatically 
  const getAllOrders = async () => {
    // gets all orders 
    const response = await fetch("/api/orders");
    // will want to put it in some array after

    
  };
  */
  const {
    orderData,
    isLoading3,
    isRefetching2,
  } = useAppQuery({
    url: `/api/orders`,
    reactQueryOptions: {
      /* Disable refetching because the QRCodeForm component ignores changes to its props */
      refetchOnReconnect: false,
    },
  });
  //order data
  console.log(orderData)

  
  const updateOrder = async (id, newDate) => {
    //make sure you are passing them in correctly, the date needs to be the correct date format as a string
    const requestOptions = {
      method:'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate })
    }
    // I did the one which has variable id's, not hardcoded, but it probably does not work as is
    const response = await fetch("/api/orders/" + id, requestOptions);
    

    
  };


  return (
    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={customers.length}
        selectable={false}
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Name" },
          { title: "Location" },
          { title: "Order count" },
          { title: "Amount spent", hidden: false },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}
