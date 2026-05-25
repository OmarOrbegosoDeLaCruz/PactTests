const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use((_, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

const initialDataStore = require("./data/orders.js");

const cloneDataStore = (orders) =>
  orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
  }));

// "In memory" data store
let dataStore = cloneDataStore(initialDataStore);

const resetDataStore = () => {
  dataStore = cloneDataStore(initialDataStore);
  return dataStore;
};

const nextOrderId = () =>
  dataStore.reduce((maxId, order) => Math.max(maxId, order.id), 0) + 1;

const getOrderIndex = (id) =>
  dataStore.findIndex((order) => order.id === Number(id));

server.get("/orders", (_, res) => {
  res.json(dataStore);
});

server.post("/orders", (req, res) => {
  const createdOrder = {
    id: nextOrderId(),
    items: req.body.items || [],
  };

  dataStore.push(createdOrder);
  res.status(201).json(createdOrder);
});

server.patch("/orders/:id", (req, res) => {
  const orderIndex = getOrderIndex(req.params.id);

  if (orderIndex < 0) {
    return res.status(404).json({ message: "Order not found" });
  }

  dataStore[orderIndex] = {
    ...dataStore[orderIndex],
    ...req.body,
    id: dataStore[orderIndex].id,
  };

  return res.json(dataStore[orderIndex]);
});

server.delete("/orders/:id", (req, res) => {
  const orderIndex = getOrderIndex(req.params.id);

  if (orderIndex < 0) {
    return res.status(404).json({ message: "Order not found" });
  }

  dataStore.splice(orderIndex, 1);
  return res.status(203).send();
});

module.exports = {
  resetDataStore,
  server,
};
