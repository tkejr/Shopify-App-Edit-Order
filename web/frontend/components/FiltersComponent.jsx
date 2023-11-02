import {
  
  LegacyCard,
  Filters,

} from "@shopify/polaris";
import React, { useState, useCallback } from "react";

const DataTableFiltersExample = ({ onSearch }) => {
  const [queryValue, setQueryValue] = useState("");
  const handleFiltersQueryChange = useCallback((value) => {
    setQueryValue(value);
    console.log("here");
    onSearch(value);
  }, []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const filters = [];

  const appliedFilters = [];

  return (
    
        <Filters
          queryValue={queryValue}
          filters={filters}
          queryPlaceholder="Search for a specific order"
          appliedFilters={appliedFilters}
          onQueryChange={handleFiltersQueryChange}
          onQueryClear={handleQueryValueRemove}
        />
     
  );
};

export default DataTableFiltersExample;
