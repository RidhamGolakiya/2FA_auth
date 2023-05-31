const Auth = require("../models/authModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// render signup form
exports.getSignup = (req, res, next) => {
  let errorMessage = req.flash("error");
  let successMessage = req.flash("success");
  res.render("signup", {
    errorMessage: errorMessage,
    successMessage: successMessage,
  });
};

// render login form
exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash("error");
  let successMessage = req.flash("success");
  res.render("login", {
    errorMessage: errorMessage,
    successMessage: successMessage,
  });
};

// render dashboard form
exports.getDashboard = (req, res, next) => {
  const user =
    req.session.user !== undefined
      ? req.session.user.user
      : res.redirect("/login");
  res.render("dashboard", { user });
};

// Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 8); //Hashed password

    const existUser = await Auth.findOne({ email });

    if (existUser) {
      req.flash("error", "User already registered. Please login.");
      return res.redirect("/login");
    } else {
      const user = new Auth({
        name,
        email,
        password: hashPassword,
      });
      user.save();
      req.flash("success", "User registered successfully");
      res.redirect("/login");
      // return res.json({ message: "User registered successfully", user: user });
    }
  } catch (e) {
    return res.json({ e });
  }
};

// Login user
exports.login = async (req, res, next) => {
  const { email, password, two_auth } = req.body;
  const user = await Auth.findOne({ email });
  if (!user) {
    // user not found
    req.flash("error", "User not found.");
    return res.redirect("/");
  }

  const userData = user?.toJSON();
  const verifyPassword = await bcrypt.compare(password, user?.password); // verify password

  if (verifyPassword === true && userData) {
    const token = jwt.sign(userData, "jwt1224", {
      // token assigned to user
      expiresIn: "24h",
    });

    req.session.user = { user, token };

    if (user.two_auth === true) {
      return res.redirect("/dashboard?two_auth=true");
    } else {
      return res.redirect("/dashboard?success=true");
    }
  } else {
    req.flash("error", "Credentials not matched.");
    return res.redirect("/login");
  }
};

// Enable two factor authentication
exports.authEnable = async (req, res) => {
  const { userId, enableTwoFactor } = req.body;
  let qrCode = "";

  let secret = speakeasy.generateSecret({
    name: "WeAreDev",
  });

  await qrcode.toDataURL(secret.otpauth_url, function (err, data) {
    if (err) {
      return res.json({ err });
    }
    qrCode = data;
  });

  Auth.findByIdAndUpdate(
    userId,
    { two_auth: enableTwoFactor, two_auth_secret: secret.ascii },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return a success response
      res.status(200).json({
        message: "Two-factor authentication status updated successfully",
        data: qrCode,
      });
    })
    .catch((error) => {
      // Handle any errors that occur during the update process
      res.status(500).json({
        error:
          "An error occurred while updating the two-factor authentication status",
      });
    });
};

// Check if the two-factor authentication after login has completed
exports.checkAuth = async (req, res) => {
  const { id, two_auth } = req.body;
  const user = await Auth.findById(id);

  if (!user) {
    return res.json({ message: "User not found" });
  }
  let verified = speakeasy.totp.verify({
    secret: user.two_auth_secret,
    encoding: "ascii",
    token: two_auth,
  });
  if (verified === true) {
    return res.status(200).json({ message: "Verified user", success: true });
  } else {
    req.session.destroy();
    return res.json({ message: "Please enter a valid key", success: false });
  }
};
