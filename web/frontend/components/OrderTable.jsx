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
import { useState, useCallback, useMemo, useEffect} from "react";
import { useAuthenticatedFetch } from "../hooks";
import { Spinner } from "@shopify/polaris";
import Paginate from "./Paginate";
import Search from "./Search";




export function OrderTable(props) {
  let orders = [];
  
  const { data, status } = useAppQuery({
    url: `/api/orders`,
    reactQueryOptions: {
      refetchOnReconnect: false,
    },
  });
  if (status === "success") {
    console.log(data);
    // dont slice it here
    //orders = data.slice(0, 10);
    orders = data
    
    
  }
  //Pagination stuff
  
  const [once, setOnce] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("#");
  const ITEMS_PER_PAGE = 1;
  const orderData = useMemo(() => {
  let computedOrders = orders;  
  computedOrders = computedOrders.filter(post => {
    if (search === '#') {
      return post;
    } else if (post.name.toLowerCase().includes(search.toLowerCase())) {
      return post;
    }
  })
  setTotalItems(computedOrders.length);
  return computedOrders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );
  }, [once, currentPage, search]);

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
  
  /*
  orders.filter(post => {
    if (value === '#') {
      console.log('vn',post)
      return post;
    } else if (post.name.toLowerCase().includes(value.toLowerCase())) {
      return post;
    }
  })
*/
  const rowMarkup = orderData.map(
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

        <IndexTable.Cell>{customer}</IndexTable.Cell>
        <IndexTable.Cell>{total_price}</IndexTable.Cell>
      </IndexTable.Row>
      
    )
  );

  return (
    <Card>
      <Search  onSearch={value => { setSearch(value);setCurrentPage(1);}}/>
      
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
        <Paginate
            total={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={page => setCurrentPage(page)}
        />
    </Card>
  );
}
