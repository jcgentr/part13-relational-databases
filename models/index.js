const Note = require("./note");
const User = require("./user");
const Team = require("./team");
const Membership = require("./membership");
const UserNotes = require("./user_notes");

User.hasMany(Note);
Note.belongsTo(User);
// Note.sync({ alter: true });
// User.sync({ alter: true });
User.belongsToMany(Team, { through: Membership });
Team.belongsToMany(User, { through: Membership });

User.belongsToMany(Note, { through: UserNotes, as: "marked_notes" });
Note.belongsToMany(User, { through: UserNotes, as: "users_marked" });

module.exports = {
  Note,
  User,
  Team,
  Membership,
  UserNotes,
};
