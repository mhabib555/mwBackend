module.exports = (sequelize, Sequelize) => {
  const Feedback = sequelize.define("users_feedback", {
    // id: {
    //   type: Sequelize.INTEGER,
    //   primaryKey: true
    // },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    message: {
      type: Sequelize.STRING
    }
  });

  return Feedback;
};