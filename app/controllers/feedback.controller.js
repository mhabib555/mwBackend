var nodemailer = require('nodemailer');
const db = require("../models");
const config = require("../config/auth.config");
const Feedback = db.feedback;

exports.sendFeedback = (req, res) => {


  $validationError = [];

  if (!req.body.name) {
    $validationError.push("Name is required");
  }

  if (!req.body.email) {
    $validationError.push("Email is required");
  }

  if (!req.body.message) {
    $validationError.push("Message is required");
  }

  if ($validationError.length > 0) {
    return res.status(422).send({ message: $validationError });
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
    from: req.body.email,
    to: 'noreply@manssourwash.com',
    subject: req.body.name + ' | Mansour Wash User Feedback',
    text: req.body.message
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(500).send({ message: "Unable to send email" });
    } else {
      // Save User to Database
      Feedback.create({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
      })
        .then(feedback => {
          res.status(200).send({ message: "Email sent" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });

    }
  });
};
