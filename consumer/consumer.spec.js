// Setting up our test framework
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect } = chai;

// We need Pact in order to use it in our test
const { provider } = require("../pact");
const { Matchers } = require("@pact-foundation/pact");
const { eachLike } = Matchers;

// Importing our system under test (the orderClient) and our Order model
const { Order } = require("./order");
const {
  createOrder,
  deleteOrder,
  fetchOrders,
  patchOrder,
} = require("./orderClient");

let newOrderId = 2;
let oldOrderId = 1;

// This is where we start writing our test
describe("Pact with Order API", () => {
  describe("given there are orders", () => {
    const itemProperties = {
      name: "burger",
      quantity: 2,
      value: 20,
    };

    const createdItemProperties = {
      name: "fries",
      quantity: 1,
      value: 5,
    };

    const updatedItemProperties = {
      name: "burger",
      quantity: 3,
      value: 20,
    };

    const orderProperties = {
      id: 1,
      items: eachLike(itemProperties),
    };

    const createdOrderProperties = {
      id: newOrderId,
      items: eachLike(createdItemProperties),
    };

    const updatedOrderProperties = {
      id: oldOrderId,
      items: eachLike(updatedItemProperties),
    };

    describe("when a call to the API is made", () => {
      it("will receive the list of current orders", async () => {
        await provider
          .addInteraction()
          .given("there are orders")
          .uponReceiving("a request for orders")
          .withRequest("GET", "/orders")
          .willRespondWith(200, (builder) => {
            builder.headers({ "Content-Type": "application/json; charset=utf-8" });
            builder.jsonBody(eachLike(orderProperties));
          })
          .executeTest(async (mockserver) => {
            process.env.API_PORT = mockserver.port;
            await expect(fetchOrders()).to.eventually.have.deep.members([
              new Order(orderProperties.id, [itemProperties]),
            ]);
          });
      });

      it("will create a new order", async () => {
        await provider
          .addInteraction()
          .given("there are orders")
          .uponReceiving("a request to create an order")
          .withRequest("POST", "/orders", (builder) => {
            builder.jsonBody({
              items: eachLike(createdItemProperties),
            });
          })
          .willRespondWith(201, (builder) => {
            builder.headers({ "Content-Type": "application/json; charset=utf-8" });
            builder.jsonBody(createdOrderProperties);
          })
          .executeTest(async (mockserver) => {
            process.env.API_PORT = mockserver.port;
            await expect(
              createOrder({ items: [createdItemProperties] })
            ).to.eventually.deep.equal(
              new Order(createdOrderProperties.id, [createdItemProperties])
            );
          });
      });

      it("will update an order", async () => {
        await provider
          .addInteraction()
          .given("there are orders")
          .uponReceiving("a request to update an order")
          .withRequest("PATCH", `/orders/${oldOrderId}`, (builder) => {
            builder.jsonBody({
              items: eachLike(updatedItemProperties),
            });
          })
          .willRespondWith(200, (builder) => {
            builder.headers({ "Content-Type": "application/json; charset=utf-8" });
            builder.jsonBody(updatedOrderProperties);
          })
          .executeTest(async (mockserver) => {
            process.env.API_PORT = mockserver.port;
            await expect(
              patchOrder(oldOrderId, { items: [updatedItemProperties] })
            ).to.eventually.deep.equal(
              new Order(updatedOrderProperties.id, [updatedItemProperties])
            );
          });
      });

      it("will delete an order", async () => {
        await provider
          .addInteraction()
          .given("there are orders")
          .uponReceiving("a request to delete an order")
          .withRequest("DELETE", `/orders/${oldOrderId}`)
          .willRespondWith(204)
          .executeTest(async (mockserver) => {
            process.env.API_PORT = mockserver.port;
            await expect(deleteOrder(oldOrderId)).to.eventually.equal(true);
          });
      });
    });
  });
});
