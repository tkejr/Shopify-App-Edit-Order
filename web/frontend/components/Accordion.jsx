import { useState } from 'react';
import { Card, Box, InlineStack, Text, Collapsible } from '@shopify/polaris';
import { ChevronUpIcon, ChevronDownIcon } from '@shopify/polaris-icons';

export const Accordion = () => {
  const [expanded, setExpanded] = useState(0); // Set to null if none should be expanded by default

  return (
    <Card padding='0'>
      {ACCORDION_ITEMS.map(({ title, id, content }) => {
        const isExpanded = expanded === id;
        return (
          <Box
            borderBlockEndWidth='025'
            borderColor='border'
            background='bg-surface-secondary'
            key={id}
          >
            <Box paddingBlock='300' paddingInline='400'>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  return setExpanded((prev) => (id === prev ? null : id));
                }}
              >
                <InlineStack align='space-between' blockAlign='center'>
                  <Text variant='headingMd' as='p'>
                    {title}
                  </Text>
                  {isExpanded ? (
                    <ChevronUpIcon width='1.5rem' height='1.5rem' />
                  ) : (
                    <ChevronDownIcon width='1.5rem' height='1.5rem' />
                  )}
                </InlineStack>
              </div>
            </Box>
            <Collapsible open={isExpanded}>
              <Box padding='400' background='bg-surface'>
                {content}
              </Box>
            </Collapsible>
          </Box>
        );
      })}
    </Card>
  );
};

const ACCORDION_ITEMS = [
  {
    id: 0,
    title: 'What if I get an error and a duplicate order is created?',
    content: (
      <Text>
        When trying to backdate or use advanced mode, a new order is created. If a transaction goes through the original order, then, 
        due to Shopify API limitations, we cannot delete the old order, causing there to be 2 orders with the same name. What you do with
        these orders is up to you. 
      </Text>
    )
  },
  {
    id: 1,
    title: 'I cannot backdate or edit my order',
    content: (
      <Text>
        Usually, if you cannot edit an order, the reason why is displayed in the error message. Messages such as "no billing address in the order"
        means you need a billing address to edit the order. If you have troubleshooted everything, it might be because the 
        customer in your order has the same email as another. 
      </Text>
    )
  },
  {
    id: 2,
    title: 'Why do I not have a free trial?',
    content: (
      <Text>
        If your store has subcribed to a plan with a free trial, then cancelled, then re-subscribed, then this new subscription does not
        have a free trial. This is to protect against people who abuse the free trial system. 
      </Text>
    )
  },
  {
    id: 3,
    title: 'How do I cancel my subscription?',
    content: (
      <Text>
        Just uninstall the app. Shopify itself deals with all the billing, and you will be charged accordingly. 
      </Text>
    )
  }
];
