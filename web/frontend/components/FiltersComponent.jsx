import {
    ChoiceList,
    TextField,
    Card,
    Filters,
    DataTable,
  } from '@shopify/polaris';
  import {useState, useCallback} from 'react';
  
const DataTableFiltersExample = ({onSearch})=>{
    
    const [queryValue, setQueryValue] = useState('');
    const handleFiltersQueryChange = useCallback(
      (value) => {setQueryValue(value); console.log('here'); onSearch(value)},
      [],
    );
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const filters = [];
    
    const appliedFilters = [];
    
  
    return (
      
        <Card>
          <Card.Section>
            <Filters
              queryValue={queryValue}
              filters={filters}
              appliedFilters={appliedFilters}
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={handleQueryValueRemove}
             
            />
          </Card.Section>
          
        </Card>
     
    );
  
    }

  export default DataTableFiltersExample