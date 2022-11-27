const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.icnwzoy.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const bookcategorycollection = client
      .db("bookwarm")
      .collection("categorey");
    const productcolection = client.db("bookwarm").collection("product");
    const usercollection = client.db("bookwarm").collection("users");

    app.get("/categorey", async (req, res) => {
      const query = {};
      const cursor = bookcategorycollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/categorey/:type", async (req, res) => {
      const type = req.params.type;
      //   console.log(type);
      const result = await productcolection.find({ type: type }).toArray();
      //   console.log(result);

      res.send(result);
    });

    app.post("/user/new", async (req, res) => {
      const response = await usercollection.insertOne(req.body);
      //   console.log(req.body);
      res.send(response);
    });

    app.get("/user/all-seller", async (req, res) => {
      const query = { type: "seller" };
      const response = await usercollection.find(query).toArray();
      res.send(response);
    });
    app.get("/user/all-buyer", async (req, res) => {
      const query = { type: "buyer" };
      const response = await usercollection.find(query).toArray();
      res.send(response);
    });

    app.get("/user/type/:email", async (req, res) => {
      const email = req.params.email;
      const response = await usercollection.findOne({ email: email });
      res.send(response.type);
    });

    app.post("/products/new", async (req, res) => {
      const newproduct = req.body;
      const response = await productcolection.insertOne(newproduct);
      res.send(response);
    });
    app.delete("/my-products/delete/:id", async (req, res) => {
      const id = req.params.id;
      const response = await productcolection.deleteOne({ _id: ObjectId(id) });
      res.send(response);
    });

    app.get("/myproduct/:email", async (req, res) => {
      const email = req.params.email;
      const response = await productcolection.find({ seller: email }).toArray();
      res.send(response);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`hello assignment twelve ${port}`);
});
