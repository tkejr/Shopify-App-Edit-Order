import { Card, EmptyState, Page } from "@shopify/polaris";
import {
  Form,
  FormLayout,
  Checkbox,
  TextField,
  Button,
  FooterHelp,
  Link,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useAuthenticatedFetch } from "../hooks";

export default function Help() {
  const fetch = useAuthenticatedFetch();
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const toastMarkup = active ? (
    <Toast content="Message sent" onDismiss={toggleActive} />
  ) : null;

  const handleSubmit = useCallback(async () => {
    const payload = {
      name: name,
      email: email,
      message: feedback,
    };

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        console.log("Email sent successfully");
        toggleActive();
        setName("");
        setEmail("");
        setFeedback("");
      } else {
        const data = await response.json();
        throw new Error(data.message || "Error sending email");
      }
    } catch (error) {
      console.error(
        "There was a problem with the fetch operation:",
        error.message
      );
    }
  }, [name, email, feedback]);

  const handleNameChange = useCallback((value) => setName(value), []);
  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handleFeedbackChange = useCallback((value) => setFeedback(value), []);

  return (
    <Frame>
      <Page title="Help and Support" defaultWidth>
        {" "}
        <Card title="Feedback">
          <Card.Section>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={name}
                  onChange={handleNameChange}
                  label="Name"
                  type="text"
                  placeholder=""
                />
                <TextField
                  value={email}
                  onChange={handleEmailChange}
                  label="Email"
                  type="email"
                  autoComplete="email"
                  helpText={
                    <span>We will never send you marketing emails</span>
                  }
                />
                <TextField
                  value={feedback}
                  onChange={handleFeedbackChange}
                  label="Feedback"
                  type="text"
                  multiline={4}
                  placeholder="How can we improve ?"
                />

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button primary submit>
                    Submit
                  </Button>
                </div>
              </FormLayout>
            </Form>
          </Card.Section>
        </Card>
        <FooterHelp>
          For More Support{" "}
          <Link url="https://www.editify.kejrtech.com">Email Us</Link>
        </FooterHelp>
      </Page>
      {toastMarkup}
    </Frame>
  );
}
