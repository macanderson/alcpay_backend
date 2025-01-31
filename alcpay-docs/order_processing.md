# Order Processing

Alcpay processes orders from Shopify stores.  The detailed order processing flow is described below.

## Order Processing Diagrams

The following diagrams and steps describe the order processing flow.


### Order Lifecycle

The order lifecycle is as follows:

```mermaid
stateDiagram-v2
    [*] --> OrderReceived
    OrderReceived --> ValidateOrder
    ValidateOrder --> ProcessFulfillment
    ProcessFulfillment --> CreateShopifyFulfillment
    CreateShopifyFulfillment --> NotifyStakeholders
    NotifyStakeholders --> ProcessPayment
    ProcessPayment --> [*]

    state ProcessFulfillment {
        [*] --> CalculateShipping
        CalculateShipping --> AssignLocation
        AssignLocation --> PrepareLineItems
        PrepareLineItems --> [*]
    }

    state NotifyStakeholders {
        [*] --> SendCustomerEmail
        [*] --> SendRetailerNotification
        SendCustomerEmail --> [*]
        SendRetailerNotification --> [*]
    }
```

### Detailed Order Processing Steps

The detailed order processing steps are as follows:

```mermaid
sequenceDiagram
    participant Client
    participant WebhookController
    participant ShopifyService
    participant MailService
    participant StripeService
    participant Database

    Client->>WebhookController: New Order Event
    WebhookController->>ShopifyService: Validate Order
    ShopifyService-->>WebhookController: Order Details
    WebhookController->>WebhookController: Calculate Shipping & Taxes
    WebhookController->>ShopifyService: Create Fulfillment
    ShopifyService-->>WebhookController: Fulfillment Created
    WebhookController->>Database: Store Fulfillment Record
    WebhookController->>MailService: Send Notifications
    WebhookController->>StripeService: Process Payment
    StripeService-->>WebhookController: Payment Confirmation
```
