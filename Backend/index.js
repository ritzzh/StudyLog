const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./Models/Tasks");
const User = require("./Models/User"); 
const axios = require("axios"); // Import axios for making HTTP requests

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

const otps = {}; 

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/send-otp", async (req, res) => {
  const { email, username } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      if (existingUser.email !== email) {
        return res.status(400).json({ error: "Username does not match email" });
      }
    } else {
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(400).json({ error: "Already existing email, login with original username" });
      }

      await User.create({ username, email });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    otps[email] = otp;

    console.log(otp, email)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Hello ${username}, your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send OTP" });
      } else {
        console.log("Email sent: " + info.response);
        res.json({ message: "OTP sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error processing OTP request:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/validate-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otps[email] && otps[email] == otp) {
    delete otps[email]; // OTP is valid, remove it from storage
    res.json({ message: "OTP validated successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/getuser", async (req, res) => {
  const {username} = req.body;
  try {
    const rtasksDoc = await Task.findOne({ name: username });
    const ritzzhList = rtasksDoc ? rtasksDoc.tasks : [];
    res.json({ ritzzhList });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/getfriend", async (req, res) => {
  const {username} = req.body;
  try {
    const jtasksDoc = await Task.findOne({ name: username });
    const jellyList = jtasksDoc ? jtasksDoc.tasks : [];
    res.json({ jellyList });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/data", async (req, res) => {
  const { username, ritzzhList } = req.body;
  try {
    await Task.findOneAndUpdate(
      { name: username },
      { tasks: ritzzhList },
      { upsert: true, new: true }
    );
    res.json({ message: "Data updated successfully for", username });
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).json({ error: "Failed to update data" });
  }
});

// Self-reloader endpoint
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Self-reloader function to keep the backend active
const selfReload = () => {
  setInterval(async () => {
    try {
      await axios.get(`http://localhost:${PORT}/ping`); // Make a GET request to the /ping endpoint
      console.log("Self-reload ping sent successfully");
    } catch (error) {
      console.error("Error with self-reload ping:", error);
    }
  }, 120000); // 120000 milliseconds = 2 minutes
};

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  selfReload(); // Start the self-reloader once the server is running
});
