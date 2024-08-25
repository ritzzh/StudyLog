const express = require("express");
const cors = require("cors");
const { json } = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const Model = require('./Models/Tasks');
const Task = require("./Models/Tasks");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "UPDATE", "DELETE"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/getdata", async (req, res) => {
    try {
      const jtasksDoc = await Task.findOne({ name: "Jelly" });
      const rtasksDoc = await Task.findOne({ name: "Ritzzh" });
  
      const jellyList = jtasksDoc ? jtasksDoc.tasks : [];
      const ritzzhList = rtasksDoc ? rtasksDoc.tasks : [];
  
      res.json({ jellyList, ritzzhList });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });

  app.post("/data", async (req, res) => {
    const { jellyList, ritzzhList } = req.body;
    try {
      await Task.findOneAndUpdate(
        { name: "Jelly" },
        { tasks: jellyList },
        { upsert: true, new: true }
      );
      await Task.findOneAndUpdate(
        { name: "Ritzzh" },
        { tasks: ritzzhList },
        { upsert: true, new: true }
      );
  
      res.json({ message: "Data updated successfully", jellyList, ritzzhList });
    } catch (err) {
      console.error("Error updating data:", err);
      res.status(500).json({ error: "Failed to update data" });
    }
  });
  
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
