import {
  IndexTable,
  LegacyCard,
  Button,
  useIndexResourceState,
  Card,
  DatePicker,
  
  ButtonGroup,
  Spinner
} from "@shopify/polaris";
//import { useAppQuery } from "../hooks";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";
import FiltersComponent from "./FiltersComponent";
import { useSelector, useDispatch } from "react-redux";

export function OrderTable(props) {
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
  //new
  const [expanded, setExpanded] = useState(false);

  //Should be 10
  const ITEMS_PER_PAGE = 10;
  //new way to get the data
  const getData = () => {
    fetch("/api/orders")
      .then((response) => response.json())
      .then((json) => {
        setRawData(json.data);
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
  const orderClicked = (id, name) => {
    // scroll.scrollToBottom(options);
    props.toggleShow();
    props.setOrderId(id);
    props.setName(name);
    dispatch({ type: "SET_PROPS_ORDER_ID", payload: id });
    dispatch({ type: "SET_PROPS_ORDER_NAME", payload: name });
  };

  //advanced Search
  const [active, setActive] = useState(false);
  const [hasDates, setHasDates] = useState(false);
  const handleChange = useCallback(() => setActive(!active), [active]);
  const getCustomOrderDates = () => {
    setStatus("loading");
    fetch("/api/orders/" + selectedDates.start + "/" + selectedDates.end)
      .then((response) => response.json())
      .then((json) => {
        setRawData(json.data);
        setStatus("success");
      });
    handleChange();
    setHasDates(true);
    //props.setReload(!props.reload)
  };
  const clearDates = () => {
    if (hasDates) {
      setStatus("loading");
      getData();
      handleChange();
      setSelectedDates({
        start: new Date(),
        end: new Date(),
      });
      //setDate({month: 8, year: 2023})
      //props.setReload(!props.reload)
    } else {
      //handleChange()
    }
    setHasDates(false);
  };
  //dates
  const newDate = new Date()
  const [{ month, year }, setDate] = useState({ month: newDate.getMonth(), year: newDate.getFullYear()});
  const [selectedDates, setSelectedDates] = useState({
    //start: new Date('Sat Sep 09 2023 00:00:00 GMT-0500 (EST)'),
    //end: new Date('Sat Sep 16 2023 00:00:00 GMT-0500 (EST)'),
    start: newDate,
    end: newDate,
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );
 

  //new stuff
  const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (totalItems > 0 && ITEMS_PER_PAGE > 0)
            setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
    }, [totalItems, ITEMS_PER_PAGE]);
  const rowMarkup = orderData.map(
    ({ name, processed_at, customer, total_price, id, currency, total_outstanding, financial_status, cancelled_at }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(name)}
        position={index}
      >
        <IndexTable.Cell>
          <Button
            variant="plain"
            dataPrimaryLink
            onClick={() => {
              orderClicked(id, name);
              
            }}
          >  
            {name}
          </Button>
        </IndexTable.Cell>
        <IndexTable.Cell>{ConvertDate(processed_at)}</IndexTable.Cell>

        <IndexTable.Cell>{customer && customer.first_name}</IndexTable.Cell>
        <IndexTable.Cell>{total_outstanding}</IndexTable.Cell>
        <IndexTable.Cell>
          {total_price} {currency}   
        </IndexTable.Cell>
        {/*
        <IndexTable.Cell>{financial_status} {cancelled_at}</IndexTable.Cell>
          */}
      </IndexTable.Row>
    )
  );

  return (
    <Card>
      {
      <FiltersComponent
        onSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
      />
      }
      <div style={{ padding: "10px" }}>
        <Button
          plain
          disclosure={expanded ? "up" : "down"}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Close" : "Filter By Date"}
        </Button>
      </div>
      {expanded && (
        <div
          style={{
            padding: "20px",
          }}
        >
          <DatePicker
            month={month}
            year={year}
            onChange={setSelectedDates}
            onMonthChange={handleMonthChange}
            selected={selectedDates}
            allowRange
          />
          <br></br>
          <ButtonGroup>
            <Button
              disabled={!hasDates}
              onClick={() => clearDates()}
              destructive
            >
              {"Clear"}{" "}
            </Button>

            <Button
              //disabled={!hasDates}
              onClick={() => getCustomOrderDates()}
              primary={true}
            >
              {" "}
              {"Search"}
            </Button>
          </ButtonGroup>
        </div>
      )}
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
            { title: "Total Outstanding" },
            { title: "Total Price" },
           
          ]}
          pagination={{
            hasNext: (currentPage < totalPages),
            hasPrevious: (currentPage > 1),
            onNext: () => {if(currentPage < totalPages) 
              {setCurrentPage(currentPage + 1)}},
            onPrevious:()=>{
              if(currentPage > 1) 
              {setCurrentPage(currentPage - 1)}
            }
          }}
        >

          {rowMarkup}
        </IndexTable>
        
      
      )}


    </Card>
  );
}
