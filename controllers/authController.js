const { check, validationResult } = require("express-validator");
const User = require("../models/users");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    errors: [],
    oldInputs: { email: "" },
    user: {},
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User email did not exist in DB"],
      oldInputs: { email },
      user: {},
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(404).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User password is incorrect"],
      oldInputs: { email },
      user: {},
    });
  }
  req.session.isLoggedIn = true;
  req.session.user = {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
  };
  await req.session.save();
  if (req.session.user.userType === "guest") {
    res.redirect("/");
  } else {
    res.redirect("/host/host-home-list");
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInputs: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userType: "",
    },
    user: {},
  });
};

exports.postSignup = [
  //Server side validations

  check("firstName")
    .notEmpty()
    .withMessage("First Name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name must be at least two characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First Naame can only contaion letters"),

  check("lastName")
    .trim()
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Last Name can only contain letters"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least eight character long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lower case letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one upper case letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@!$#%&^*]/)
    .withMessage("Password must contain at least one special character"),

  check("confirmPassword")
    .trim()
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password don't match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("User type is required")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  check("terms")
    .notEmpty()
    .withMessage("Accept the terms and conditions")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("Please accept the terms");
      }
      return true;
    }),

  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInputs: { firstName, lastName, email, password, userType },
        user: {},
      });
    } else {
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType,
        });
        user
          .save()
          .then(() => {
            console.log("User is added to the DB");
            res.redirect("/auth/login");
          })
          .catch((error) => {
            res.status(404).render("auth/signup", {
              pageTitle: "Signup",
              currentPage: "signup",
              isLoggedIn: false,
              errors: [error.message],
              oldInputs: { firstName, lastName, email, password, userType },
              user: {},
            });
          });
      });
    }
  },
];
