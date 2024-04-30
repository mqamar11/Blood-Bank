const { USER_ROLES } = require("@constants");

const is_admin = (user) => user.role === USER_ROLES.ADMIN;

module.exports = {
  is_admin,
};
