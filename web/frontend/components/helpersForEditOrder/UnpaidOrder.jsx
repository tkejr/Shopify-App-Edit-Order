import {
    Button,
    Modal,
    LegacyStack,
    TextContainer,
    Frame,
  } from '@shopify/polaris';
import {useState, useCallback} from 'react';
import { useNavigate, useAuthenticatedFetch} from '@shopify/app-bridge-react';
import { useSelector, useDispatch } from "react-redux";
const UnpaidOrder = (props) => {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const fetch = useAuthenticatedFetch()
    const toggleModal = useCallback(() => setActive((active) => !active), []);
    const dispatch = useDispatch()
    const activator = <Button onClick={toggleModal}>Open</Button>;
    const orderId = useSelector((state) => state.orderId);
    const makeOrderUnpaid = async () =>{
         //setUpdateButton("Loading...");
      setLoading(true);
      
      
      
      try {
        const response = await fetch(`/api/unpaid/${orderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        
        
        if (!response.ok) {
          setLoading(false);
         //setErrorContent("There was an error updating the order details to the order. Contact Support: ");
         props.handleError();
         if(response.status === 502){
          props.setErrorContent(
            "There was an error updating the date. Make sure the order you are trying to backdate has a customer. If the error persists, contact support:  "
          );
          
         
        }
        else if(response.status === 501){
          props.setErrorContent(
            "There was an error updating the date. Make sure the order you are trying to backdate has a billing address. If the error persists, contact support:  "
          );
         
        }
        else if(response.status === 503){
          props.setErrorContent(
            "There was an error updating the date. Make sure the order you are trying to backdate has a shipping address. If the error persists, contact support:   "
          );
         
        }
        else{
          props.setErrorContent(
            "If a duplicate order was created, then the original order cannot be deleted due to shopify api limitations. Otherwise, an unknown error occurred:  "
          );
        }
        
      }
        else{
        
          setLoading(false);
          props.setToastProps({ content: "Order details updated successfully" });
          dispatch({ type: "SET_PROPS_ORDER_ID", payload: false });
          dispatch({ type: "SET_PROPS_ORDER_NAME", payload: false });
          dispatch({ type: "SET_PROPS_LINE_ITEMS", payload: [] });
          props.setLineItems([]);
          navigate("/EditOrder")
        }
       
      } catch (error) {
        // Handle error, e.g., show an error message
        setLoading(false);
        props.setErrorContent(
         "There was an error updating the order details to the order. Contact Support: "
        );
        props.handleError();
        toggleModal();
      }
    
    }
    return (
      
          <Modal
            activator={activator}
            open={active}
            onClose={toggleModal}
            title="Make a test order unpaid"
            primaryAction={{
              content: loading ? 'Loading' : 'Submit',
              onAction: () => makeOrderUnpaid()
            }}
          >
            <Modal.Section>
              <LegacyStack vertical>
                <LegacyStack.Item>
                  <TextContainer>
                    <p>
                      This will create a new order. If it was paid, then the new order will be unpaid. 
                      Clicking Submit will take you back to the list of orders. 
                    </p>
                  </TextContainer>
                </LegacyStack.Item>
              </LegacyStack>
            </Modal.Section>
          </Modal>
        
    );
  }

export default UnpaidOrder; 