const request = require("superagent");
const { Order } = require("./order");

const hostname = "127.0.0.1"
const ordersUrl = () => `http://${hostname}:${process.env.API_PORT}/orders`;

const toOrder = (order) => new Order(order.id, order.items);

const handleError = (err) => {
  console.log(err)
  throw new Error(`Error from response: ${err.body}`);
};

const fetchOrders = () => {
  return request.get(ordersUrl()).then(
    (res) => res.body.map(toOrder),
    handleError
  );
};

const createOrder = (order) => {
  return request.post(ordersUrl()).send(order).then(
    (res) => toOrder(res.body),
    handleError
  );
};

const patchOrder = (id, patch) => {
  return request.patch(`${ordersUrl()}/${id}`).send(patch).then(
    (res) => toOrder(res.body),
    handleError
  );
};

const deleteOrder = (id) => {
  return request.delete(`${ordersUrl()}/${id}`).then(
    () => true,
    handleError
  );
};

module.exports = {
  createOrder,
  deleteOrder,
  fetchOrders,
  patchOrder,
};
