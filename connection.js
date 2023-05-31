const mongoose = require("mongoose");

const db = process.env.MONGO_URI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    try {
      console.log("Database connected");
    } catch (err) {
      console.log("Error:", err);
    }
  });
