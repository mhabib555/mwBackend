var nodemailer = require('nodemailer');
const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const PasswordReset = db.passwordReset;
const uuid = require('uuid');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {

  $validationError = [];

  if (!req.body.name) {
    $validationError.push("Name is required");
  }

  if (!req.body.username) {
    $validationError.push("Username is required");
  }

  if (!req.body.email) {
    $validationError.push("Email is required");
  }

  if (!req.body.password) {
    $validationError.push("Password is required");
  }

  if ($validationError.length > 0) {
    return res.status(422).send({ message: $validationError });
  }

  // Save User to Database
  User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {

  $validationError = [];

  if (!req.body.username) {
    $validationError.push("Username is required");
  }

  if (!req.body.password) {
    $validationError.push("Password is required");
  }

  if ($validationError.length > 0) {
    return res.status(422).send({ message: $validationError });
  }

  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ error: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.forget = (req, res) => {

  $validationError = [];

  if (req.body.username || req.body.email) {
  } else {
    $validationError.push("Username/Email is required");
  }

  if ($validationError.length > 0) {
    return res.status(422).send({ message: $validationError });
  }

  if (req.body.username) {
    User.findOne({
      where: {
        username: req.body.username
      }
    })
      .then(user => {
        if (!user) {
          return res.status(404).send({ error: "User Not found." });
        }


        var transporter = nodemailer.createTransport({
          // service: 'gmail',
          // auth: {
          //   user: 'youremail@gmail.com',
          //   pass: 'yourpassword'
          // }
          host: 'manssourwash.com',
          port: 465,
          auth: {
            user: 'noreply@manssourwash.com',
            pass: '1421998@@@@'
          }
        });

        var mailOptions = {
          from: 'noreply@manssourwash.com',
          to: user.email,
          subject: 'Password Reset | Mansour Wash',
          text: 'Please follow the below link for password request'
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            res.status(500).send({ message: "Unable to send email" });
          } else {
            // Save User to Database
            PasswordReset.create({
              user_id: user.id,
              reset_token: uuid.v4()
            })
              .then(feedback => {
                res.status(200).send({ message: "Email sent" });
              })
              .catch(err => {
                res.status(500).send({ message: err.message });
              });

          }
        });

      });
  } else {
    User.findOne({
      where: {
        email: req.body.email
      }
    })
      .then(user => {
        if (!user) {
          return res.status(404).send({ error: "User Not found." });
        }
        console.log(user);
        console.log(user.email);
        console.log(uuid.v4());


        var transporter = nodemailer.createTransport({
          // service: 'gmail',
          // auth: {
          //   user: 'youremail@gmail.com',
          //   pass: 'yourpassword'
          // }
          host: 'manssourwash.com',
          port: 465,
          auth: {
            user: 'noreply@manssourwash.com',
            pass: '1421998@@@@'
          }
        });

        var mailOptions = {
          from: 'noreply@manssourwash.com',
          to: user.email,
          subject: 'Password Reset | Mansour Wash',
          text: 'Please follow the below link for password request'
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            res.status(500).send({ message: "Unable to send email" });
          } else {
            // Save User to Database
            console.log(PasswordReset);
            PasswordReset.create({
              user_id: user.id,
              reset_token: uuid.v4()
            })
              .then(feedback => {
                res.status(200).send({ message: "Email sent" });
              })
              .catch(err => {
                res.status(500).send({ message: err.message });
              });

          }
        });

      });

  }

};

exports.update = (req, res) => {

  $validationError = [];

  if (!req.body.name) {
    $validationError.push("Name is required");
  }

  if (!req.body.password) {
    $validationError.push("Password is required");
  }

  if ($validationError.length > 0) {
    return res.status(422).send({ message: $validationError });
  }

  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ error: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};