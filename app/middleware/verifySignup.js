const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {

  $validationError = [];

  if (! req.body.username) {
    $validationError.push("Username is required");
  }
  
  if (! req.body.email) {
    $validationError.push("Email is required");
  }
  
  if($validationError.length > 0) {
    return res.status(422).send({ message: $validationError });
  }


  // Username
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: "Failed! Username is already in use!"
      });
      return;
    }

    // Email
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  $validationError = [];

  if (! req.body.roles) {
    $validationError.push("Roles are required");
  }
  
  if($validationError.length > 0) {
    return res.status(422).send({ message: $validationError });
  }

  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};


const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    checkRolesExisted: checkRolesExisted
  };
  
  module.exports = verifySignUp;


  