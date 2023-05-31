const bcrypt = require("bcryptjs");
const Auth = require("../models/authModel");

exports.seedDefault = async (req, res, next) => {
  const admin = await Auth.findOne({ email: "demo@demo.com" });
  if (!admin) {
    const hashedPw = await bcrypt.hash("123456", 8);
    await Auth.create({
      name: "Admin",
      email: "demo@demo.com",
      password: hashedPw,
    });
    console.log("Default user added successfully");
  }
};
