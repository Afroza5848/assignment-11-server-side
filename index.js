const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser())

//  verify token -----------------------
const verifyToken = (req,res,next) => {
  const token = req.cookies.token;
  if(!token){
    return res.status(401).send({massage: 'Unauthorized access'});
  }
  if(token){
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if(err){
        console.log(err);
        return res.status(401).send({massage: 'Unauthorized access'});
      }
      console.log(decoded);
      req.user = decoded;
      next();
    })
  }
}


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
const bookingsCollection = client.db('roomsDB').collection('bookings');
const reviewCollection = client.db('roomsDB').collection('review');

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // jwt create--------------------------
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
        .send({ success: true })
    })
    //  clear token for delete-----------------------------
    app.get('/logOut', async (req, res) => {
      res.clearCookie('token',  {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 0
      })
        .send({ success: true })
    })

    // get all data-----------------------------------
    app.get('/rooms', async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result)
    })
    app.get('/bookings', async (req, res) => {
      const result = await bookingsCollection.find().toArray();
      res.send(result)
    })
    // get single dat------------------
    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.findOne(query)
      res.send(result)
    })
    // get single data by the email-----------------
    app.get('/bookings/:email',verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      const email = req.params.email;
      if(tokenEmail !== email){
        return res.status(403).send({massage: 'forbidden access'});
      }
      const query = { user_email: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);

    })
    // get data tnto featured section--------------------
    app.get('/rooms', async (req, res) => {
      const feature = req.params.feature;
      const query = { feature: "Yes" };
      console.log(query);
      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });
    // insert all room data--------------------------------
    app.post("/rooms", async (req, res) => {
      console.log(req.body);
      const result = await roomsCollection.insertOne(req.body);
      res.send(result)
    })
    // bookings data insert------------------
    app.post("/bookings", async (req, res) => {
      console.log(req.body);
      const result = await bookingsCollection.insertOne(req.body);
      res.send(result);
    })
    // on property update------------------------
    app.patch('/rooms/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const status = req.body;
      console.log(status);
      const updateDoc = {
        $set: status
      }
      const result = await roomsCollection.updateOne(query, updateDoc);
      res.send(result)
    })
    // delete data from bookings collection--------------------
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
    })

    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const startDate = req.body;
      console.log(startDate);
      const updateDoc = {
        $set: startDate
      }
      const result = await bookingsCollection.updateOne(query, updateDoc);
      res.send(result)
    })
    // feature----------------------------------------------------
    // app.get('/room/:feature', async (req, res) => {
    //   const query = { feature:"Yes" };
    //   console.log(query);
    //   const result = await roomsCollection.find(query).toArray();
    //   res.send(result);
    // });
    // app.get('/room/:feature', async (req, res) => {
    //   const feature = req.params.feature;
    //   const query = { feature: "Asa"}; // Assuming 'feature' is a field in your room documents
    //   console.log(query);

    //   try {
    //     const result = await roomsCollection.find(query).toArray();
    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error fetching rooms:", error);
    //     res.status(500).send("Internal Server Error");
    //   }
    // });

    //review post data---------------------------------------------
    app.post("/review", async (req, res) => {
      console.log(req.body);
      const result = await reviewCollection.insertOne(req.body);
      res.send(result)
    })
    // review get data --------------------------------------------
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
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