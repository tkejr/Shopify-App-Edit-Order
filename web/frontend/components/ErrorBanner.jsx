import React, { useState, useEffect, useCallback } from "react";
import { Modal, TextContainer, Banner } from "@shopify/polaris";

function ErrorBanner({ open, onClose, content }) {
  const [isError, setIsError] = useState(open);

  useEffect(() => {
    if (open) {
      setIsError(true);
      const timer = setTimeout(() => {
        setIsError(false);
        onClose();
      }, 5000); // 5000 ms = 5 seconds

      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, onClose]);

  const handleError = useCallback(() => {
    setIsError(false);
    onClose();
  }, [onClose]);

  return (
    <Modal open={isError} onClose={handleError} title="Error Message">
      <Modal.Section>
        <TextContainer>
          <Banner status="critical">
            <p>{content}</p>
          </Banner>
        </TextContainer>
      </Modal.Section>
    </Modal>
  );
}

export default ErrorBanner;
