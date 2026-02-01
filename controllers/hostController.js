//Local Modules
const Home = require("../models/home");
const User = require("../models/users");
const fs = require("fs");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddHome = (req, res, next) => {
  console.log(req.file);
  const { houseName, price, location, rating, description } = req.body;
  const photo = req.file.path;
  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
  });
  home
    .save()
    .then(() => {
      console.log("Home added successfully");
    })
    .catch((error) => {
      console.log("Error in adding home:", error);
    })
    .finally(() => {
      res.redirect("/host/host-home-list");
    });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "hostHomes",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("No home to edit");
      return res.redirect("/host/host-home-list");
    }
    res.render("host/edit-home", {
      pageTitle: "Edit Home",
      currentPage: "hostHomes",
      editing: editing,
      home: home,
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;
      if (req.file) {
        fs.unlink(home.photo, (error) => {
          if (error) {
            console.log("Error in deleting/unlinking previous home image: ", error);
          }
        });
        home.photo = req.file.path;
      }
      home
        .save()
        .then(() => {
          console.log("Home updated successfully");
        })
        .catch((error) => {
          console.log("Home updating error: ", error);
        });
    })
    .catch((error) => {
      console.log("Error while finding home: ", error);
    })
    .finally(() => {
      res.redirect("/host/host-home-list");
    });
};

exports.postDeleteHome = async (req, res, next) => {
  const homeId = req.params.homeId;

  await User.updateMany({ favourite: homeId }, { $pull: { favourite: homeId } });

  Home.findByIdAndDelete(homeId)
    .then(() => {
      console.log("Home deleted successfully");
    })
    .catch((error) => {
      console.log("Error in deleting home:", error);
    })
    .finally(() => {
      res.redirect("/host/host-home-list");
    });
};
