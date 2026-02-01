//Local Modules
const Home = require("../models/home");
const User = require("../models/users");

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "home",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourite");
  res.render("store/favourite-list", {
    favouriteHomes: user.favourite,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  try {
    const favouriteId = req.body.id;
    const userId = req.session.user._id;
    await User.findByIdAndUpdate(userId, {
      $addToSet: { favourite: favouriteId },
    });
  } catch (error) {
    console.log("Error in adding to favourite: ", error);
  } finally {
    res.redirect("/favourites");
  }
};

exports.postRemoveFromFavourites = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    await User.findByIdAndUpdate(userId, {
      $pull: { favourite: homeId },
    });
  } catch (error) {
    console.log("Error while deleting", error);
  } finally {
    res.redirect("/favourites");
  }
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        pageTitle: "Home Details",
        home: home,
        currentPage: "home",
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};
