const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uc5r0l2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const roomsCollection = client.db('roomsDB').collection('rooms');

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    
    // get all data-----------------------------------
    app.get('/rooms', async(req,res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result)
    })
    // get single dat------------------
    app.get('/rooms/:id', async(req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await roomsCollection.findOne(query)
      res.send(result)
    })

    // insert all room data--------------------------------
    app.post("/rooms", async(req,res) => {
        console.log(req.body);
        const result = await roomsCollection.insertOne(req.body);
        res.send(result)
    })
    // on property update------------------------
    app.patch('/rooms/:id', async(req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)};
      const status = req.body;
      console.log(status);
      const updateDoc = {
        $set: status
      }
      const result = await roomsCollection.updateOne(query,updateDoc);
      res.send(result)
    })











    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('stay-spot server is running')
})
app.listen(port, () => {
    console.log(`stay-spot server create on port:${port}`);
})