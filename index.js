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
    const bookCategoryCollection = client
      .db("bookwarm")
      .collection("categorey");

    const productCollection = client.db("bookwarm").collection("product");
    const userCollection = client.db("bookwarm").collection("users");
    const orderCollection = client.db("bookwarm").collection("orders");
    const onlineBooksCollection = client.db("bookwarm").collection("books");
    const allProductCollection = client.db("bookwarm").collection("allProduct");
    const bookingOrderCOllection = client.db("bookwarm").collection("order");
    const communityCOllection = client.db("bookwarm").collection("community");
    const wishlistCollection = client.db("bookwarm").collection("wishlists");

    // 3 ta type of categorey
    app.get("/categorey", async (req, res) => {
      const query = {};
      const cursor = bookCategoryCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // click categorey show 2 card
    app.get("/categorey/:type", async (req, res) => {
      const type = req.params.type;

      const result = await productCollection.find({ type: type }).toArray();

      res.send(result);
    });

    app.post("/user/new", async (req, res) => {
      const response = await userCollection.insertOne(req.body);
      //   console.log(req.body);
      res.send(response);
    });

    app.get("/user/all-seller", async (req, res) => {
      const query = { type: "seller" };
      const response = await userCollection.find(query).toArray();
      res.send(response);
    });
    app.get("/user/all-buyer", async (req, res) => {
      const query = { type: "buyer" };
      const response = await userCollection.find(query).toArray();
      res.send(response);
    });

    app.get("/user/type/:email", async (req, res) => {
      const email = req.params.email;
      const response = await userCollection.findOne({ email: email });
      res.send(response.type);
    });

    app.post("/products/new", async (req, res) => {
      const newProduct = req.body;
      const response = await productCollection.insertOne(newProduct);
      res.send(response);
    });
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const response = await productCollection
        .find({ seller: email })
        .toArray();
      res.send(response);
    });

    app.delete("/user/delete/:id", async (req, res) => {
      const id = req.params.id;
      const response = await userCollection.deleteOne({ _id: ObjectId(id) });
      console.log(response);
      res.send(response);
    });

    app.post("/orders", async (req, res) => {
      const formData = req.body;

      const response = await orderCollection.insertOne(formData);

      res.send(response);
    });
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const response = await orderCollection.find({ email: email }).toArray();
      res.send(response);
    });

    app.get("/myproduct/:email", async (req, res) => {
      const email = req.params.email;
      const response = await productCollection
        .find({ seller: email })
        .toArray();
      res.send(response);
    });

    // online search books

    app.get("/books", async (req, res) => {
      const query = {};
      const cursor = onlineBooksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // single online Books
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const response = await onlineBooksCollection.findOne({
        _id: ObjectId(id),
      });

      res.send(response);
    });
    // find allProuct
    app.get("/material", async (req, res) => {
      const query = {};
      const result = await allProductCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/material/:id", async (req, res) => {
      const id = req.params.id;
      const response = await allProductCollection.findOne({
        _id: ObjectId(id),
      });

      res.send(response);
    });

    // booking order
    app.post("/order", async (req, res) => {
      const formData = req.body;
      const response = await bookingOrderCOllection.insertOne(formData);
      console.log(response);
      res.send(response);
    });
    // find order by email

    app.get("/all-order", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await bookingOrderCOllection.find(query).toArray();
      res.send(result);
      console.log(result);
    });

    // delete
    app.delete("/all-order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingOrderCOllection.deleteOne(query);
      res.send(result);
      console.log(result);
    });

    app.post("/community", async (req, res) => {
      const formData = req.body;
      console.log(formData);
      const result = await communityCOllection.insertOne(formData);
      console.log(result);
      res.send(result);
    });

    app.get("/community", async (req, res) => {
      const query = {};
      const result = await communityCOllection.find(query).toArray();
      res.send(result);
    });

    // wishlist routes
    app.get("/wishlist/:email", async (req, res) => {
      const { email } = req.params;
      const foundWishlist = await wishlistCollection.findOne({ email });
      res.status(200).json(foundWishlist);
    });

    app.put("/wishlist/:email", async (req, res) => {
      const {
        body: { books },
        params: { email },
      } = req;

      const existingWishlist = await wishlistCollection.findOne({
        email,
      });

      if (existingWishlist) {
        const updatedWishlist = wishlistCollection.updateOne(
          { email },
          { $set: { books: books } },
          { upsert: true }
        );

        return res.json(updatedWishlist);
      }

      const newWishlist = await wishlistCollection.insertOne({
        email,
        books,
      });

      res.json(newWishlist);
    });

    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      console.log(result);
      res.send(result);
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
