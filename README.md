# Pact Tests - Order API

This repository is a small, evolving contract-testing project for an Order API. It uses Pact to describe and verify the HTTP contract between:

- Consumer: `GettingStartedOrderWeb`
- Provider: `GettingStartedOrderApi`

The project started from the Pact getting-started example, but the scope here is now narrower and more practical: exercising the Order API contract with a lightweight consumer client, an Express provider, generated pact files, and CI verification across supported Node versions.

## Current Scope

This project currently focuses on contract coverage for basic order operations:

- Listing orders
- Creating an order
- Updating an order through the new `PATCH /orders/:id` endpoint
- Deleting an order
- Verifying the provider against the generated pact contract

It is not intended to be a full production API, UI application, database-backed service, or complete Pact Broker tutorial. Those may become relevant later, but they are outside the current project scope.

## API Endpoints

The provider is implemented in `provider/provider.js` and currently exposes:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/orders` | Returns the current in-memory list of orders. |
| `POST` | `/orders` | Creates a new order and returns it with a generated id. |
| `PATCH` | `/orders/:id` | Updates an existing order. Returns `404` when the order does not exist. |
| `DELETE` | `/orders/:id` | Deletes an existing order. Returns `204` on success and `404` when the order does not exist. |

The data store is intentionally in-memory so that the contract tests remain fast and easy to reason about. Provider state is reset during verification through the `there are orders` state handler.

## Project Structure

```text
consumer/
  consumer.spec.js   # Consumer Pact tests
  orderClient.js     # HTTP client used by the consumer tests
  order.js           # Order model

provider/
  provider.js        # Express Order API provider
  provider.spec.js   # Pact provider verification
  data/orders.js     # Initial in-memory order data

pacts/
  *.json             # Generated Pact contract files

scripts/ci/test.sh   # CI test entry point
```

## Running Locally

Install dependencies:

```bash
npm install
```

Run the consumer Pact tests and generate the pact file:

```bash
npm run test:consumer
```

Run provider verification:

```bash
npm run test:provider
```

Run the full local test flow:

```bash
npm test
```

Inspect the generated pact:

```bash
npm run pact:show
```

## CI

The `IntegrationTests` workflow runs the test script on:

- Ubuntu, macOS, and Windows
- Node.js 20, 22, and 24

The workflow is triggered for changes to the consumer, provider, pact files, package files, CI script, and workflow configuration.

## Pact Broker Support

The repository still includes basic Pact Broker-oriented scripts:

```bash
npm run pact:publish
npm run test:broker
```

Broker usage is optional for the current scope. The local contract generation and provider verification flow is the primary path for this project right now.

## Evolution Notes

This project is intentionally evolving. The contract surface has already expanded beyond the original read-only `GET /orders` example to include create, update, and delete behaviours. Future changes should keep the README, consumer pact tests, provider implementation, and CI workflow aligned so the documented scope reflects what the project actually verifies.
