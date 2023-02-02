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
import FiltersComponent from "./FiltersComponent";



export function OrderTable(props) {
  let orders = [];
  const fetch = useAuthenticatedFetch()
  /*
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
  */
  //Pagination stuff
  
  const [rawData, setRawData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("#");
  //Should be 10
  const ITEMS_PER_PAGE = 10;
  //new way to get the data
  useEffect(() => {
    const getData = () => {
        

        fetch("/api/orders")
            .then(response => response.json())
            .then(json => {
                
                setRawData(json);
                setStatus("success")
                
            });
    };

    getData();
}, []);
  const orderData = useMemo(() => {
  let computedOrders = rawData;  
  
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
  }, [rawData, currentPage, search]);

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
           
        <IndexTable.Cell>{customer.first_name}</IndexTable.Cell>
        <IndexTable.Cell>{total_price}</IndexTable.Cell>
      </IndexTable.Row>
      
    )
  );
  

  return (
    <Card >
      <FiltersComponent onSearch={value => { setSearch(value);setCurrentPage(1);}}/>
      {status !== "success" ? (
        <Spinner accessibilityLabel="Spinner example" size="large" />
      ) : (
        <IndexTable
          resourceName={resourceName}
          itemCount={orderData.length}
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
