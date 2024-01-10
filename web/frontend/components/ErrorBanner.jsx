import React, { useState, useEffect, useCallback } from "react";
import { Modal, TextContainer, Banner, Button, Link } from "@shopify/polaris";

function ErrorBanner({
  open,
  onClose,
  content,
  url,
  buttonText,
  buttonAction,
}) {
  const [isError, setIsError] = useState(open);

  useEffect(() => {
    if (open) {
      setIsError(true);
      const timer = setTimeout(() => {
        setIsError(false);
        onClose();
      }, 11000); // 10000 ms = 10 seconds, people are slow readers

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
    <>
      {isError && (
        <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
          <Banner title="Error" onDismiss={() => handleError()} tone="critical">
            <p>{content}</p>

            <div style={{ paddingTop: "10px" }}>
              <Link target="_blank" url={url}>
                {(buttonText !== "" || buttonText == "undefined" ) && (
                  <Button onClick={() => buttonAction()}>{buttonText}</Button>
                )}
              </Link>
            </div>
          </Banner>
        </div>
      )}
    </>
  );
}

export default ErrorBanner;
