import {
  IndexTable,
  Card,
  Button,
  useIndexResourceState,
  Filters,
  Select,
  TextField,
  Modal,
  DatePicker
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
  //Should be 10
  const ITEMS_PER_PAGE = 10;
  //new way to get the data
  const getData = () => {
    fetch("/api/orders")
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
      setHasDates(true)
      //props.setReload(!props.reload)
}
const clearDates = () => {
  if(hasDates){
    setStatus('loading')
    getData()
    handleChange()
    //props.setReload(!props.reload)
  }
  else{
    handleChange()
  }
  setHasDates(false)
   
}
//dates
const [{month, year}, setDate] = useState({month: 7, year: 2023});
const [selectedDates, setSelectedDates] = useState({
start: new Date('Wed Aug 07 2023 00:00:00 GMT-0500 (EST)'),
end: new Date('Sat Aug 10 2023 00:00:00 GMT-0500 (EST)'),
});

const handleMonthChange = useCallback(
(month, year) => setDate({month, year}),
[],
);
  const rowMarkup = orderData.map(
    ({ name, processed_at, customer, total_price, id, currency }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(name)}
        position={index}
      >
        <IndexTable.Cell>
          <Button
            plain
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
        <IndexTable.Cell>{total_price} {currency}</IndexTable.Cell>
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
      <div style={{padding:"10px"}}>
      <Button fullWidth  onClick={()=> handleChange()}>  Advanced Search </Button>
      </div>
        <Modal
        //activator={activator}
        open={active}
        onClose={handleChange}
        title="Find Orders by Date"
        secondaryActions={[{
          content: "Clear",
          onAction: () => clearDates(),
        }]}
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
