module.exports = (sequelize, Sequelize) => {
  const PasswordReset = sequelize.define("users_password_reset", {
    // id: {
    //   type: Sequelize.INTEGER,
    //   primaryKey: true
    // },
    user_id: {
      type: Sequelize.INTEGER
    },
    reset_token: {
      type: Sequelize.STRING
    }
  });

  return PasswordReset;
};