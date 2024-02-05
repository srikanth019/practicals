const express = require("express");
const passport = require("passport");
const cookieSession = require("cookie-session");
const app = express();
require("./passport-setup");
app.set("view engine", "ejs");

app.use(
  cookieSession({
    name: "tuto-session",
    keys: ["key1", "key2"],
  })
);

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};
app.use(passport.initialize());

app.use(passport.session());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/profile", isLoggedIn, (req, res) => {
  console.log(req.user);
  res.render("pages/profile.ejs", {
    name: req.user.displayName,
    pic: req.user.photos[0].value,
    email: req.user.emails[0].value,
    profile: req.user.provider,
  });
});

app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);
app.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/failed",
  })
);

app.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", {
    scope: ["r_emailaddress", "r_liteprofile"],
  })
);

app.get(
  "/auth/twitter",
  passport.authenticate("twitter", {
    scope: ["r_emailaddress", "r_liteprofile"],
  })
);

app.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

app.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/good",
    failureRedirect: "/",
  })
);

app.use("/failed", (req, res) => {
  res.send("Failed to social login");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is up ${PORT}`);
});
