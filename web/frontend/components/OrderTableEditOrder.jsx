import {
    IndexTable,
    Card,
    Button,
    useIndexResourceState,
    Filters,
    Select,
    TextField,
    Modal,
    DatePicker,
    Layout,
    
  } from "@shopify/polaris";
  import React from "react";
  import { useAppQuery } from "../hooks";
  import { useState, useCallback, useMemo, useEffect } from "react";
  import { useAuthenticatedFetch } from "../hooks";
  import { Spinner } from "@shopify/polaris";
  import Paginate from "./Paginate";
  import FiltersComponent from "./FiltersComponent";
  import { Link, Scroll } from "react-scroll";
  import { useSelector, useDispatch } from "react-redux";
  
  export function OrderTableEditOrder(props) {
    let orders = [];
    const fetch = useAuthenticatedFetch();
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
    const getData = () => {
      fetch("/api/orders/unfulfilled")
        .then((response) => response.json())
        .then((json) => {
          setRawData(json);
          setStatus("success");
        });
    };
  
    useEffect(() => {
      
      getData();
    }, [props.reloadComp]);
    const orderData = useMemo(() => {
      let computedOrders = rawData;
  
      computedOrders = computedOrders.filter((post) => {
        if (search === "#") {
          return post;
        } else if (post.name.toLowerCase().includes(search.toLowerCase())) {
          return post;
        }
      });
  
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
    const dispatch = useDispatch();
    const orderClicked = (id, name, line_items) => {
      // scroll.scrollToBottom(options);
      
      props.toggleShow();
      props.setOrderId(id);
      props.setName(name);
      props.setLineItems(line_items);
  
      dispatch({ type: "SET_PROPS_ORDER_ID", payload: id });
      dispatch({ type: "SET_PROPS_ORDER_NAME", payload: name });
      dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: line_items });
    };
  


    //advanced search
    
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() =>  setActive(!active) , [active]  );
    const getCustomOrderDates = () => {
        

         setStatus('loading')
            fetch("/api/orders/" + selectedDates.start + "/" + selectedDates.end)
              .then((response) => response.json())
              .then((json) => {
                setRawData(json);
                setStatus("success");
              });
          handleChange()
          props.setReload(!props.reload)
    }

    //dates
    const [{month, year}, setDate] = useState({month: 6, year: 2023});
    const [selectedDates, setSelectedDates] = useState({
    start: new Date('Wed Jul 07 2023 00:00:00 GMT-0500 (EST)'),
    end: new Date('Sat Jul 10 2023 00:00:00 GMT-0500 (EST)'),
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({month, year}),
    [],
  );

    //for the table
    const rowMarkup = orderData.map(
      ({ name, processed_at, customer, total_price, id, line_items }, index) => (
        <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources.includes(name)}
          position={index}
        >
          <IndexTable.Cell>
            <Button
              primary
              dataPrimaryLink
              onClick={() => {
                orderClicked(id, name, line_items);
              }}
            >
              {name}
            </Button>
          </IndexTable.Cell>
          <IndexTable.Cell>{ConvertDate(processed_at)}</IndexTable.Cell>
  
          <IndexTable.Cell>{customer && customer.first_name}</IndexTable.Cell>
          <IndexTable.Cell>${total_price}</IndexTable.Cell>
        </IndexTable.Row>
      )
    );
  
    return (
      <Card>
       
     
            <FiltersComponent
                onSearch={(value) => {
                setSearch(value);
                setCurrentPage(1);
                }}
            />
        
            
            <Button  fullWidth onClick={()=> handleChange()}>  Advanced Search </Button>
            
            
           
        
        
        
        
        <Modal
        //activator={activator}
        open={active}
        onClose={handleChange}
        title="Find Orders by Date"
        primaryAction={{
          content: "Search",
          onAction: () => getCustomOrderDates(),
        }}
      >
        <Modal.Section>
        <DatePicker
            month={month}
            year={year}
            onChange={setSelectedDates}
            onMonthChange={handleMonthChange}
            selected={selectedDates}
            allowRange
        />
        </Modal.Section>
      </Modal>
        <br></br>
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
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>
    );
  }
  