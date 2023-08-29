const router = require("express").Router();

const { User, Note, Team } = require("../models");
const { tokenExtractor, isAdmin } = require("../util/middleware");

router.get("/", async (req, res) => {
  const users = await User.findAll({
    include: [
      {
        model: Note,
        attributes: { exclude: ["userId"] },
      },
      {
        model: Team,
        attributes: ["name", "id"],
        through: {
          attributes: [],
        },
      },
    ],
  });
  res.json(users);
  // admins with the string jami in their name
  // const jamiUsers = User.scope('admin', { method: ['name', '%jami%'] }).findAll()
  // const users = await User.with_notes(2)
  // console.log(JSON.stringify(users, null, 2))
});

router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [""] },
    include: [
      {
        model: Note,
        attributes: { exclude: ["userId"] },
      },
      {
        model: Note,
        as: "marked_notes",
        attributes: { exclude: ["userId"] },
        through: {
          attributes: [], // don't include anything from join table
        },
        include: {
          model: User,
          attributes: ["name"],
        },
      },
      {
        model: Team,
        attributes: ["name", "id"],
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (!user) {
    return res.status(404).end();
  }

  let teams = undefined;
  if (req.query.teams) {
    teams = await user.getTeams({
      attributes: ["name"],
      joinTableAttributes: [],
    });
  }
  res.json({ ...user.toJSON(), teams });
  // const jami = await User.findOne({ name: 'Jami Kousa'})
  // const cnt = await jami.number_of_notes()
  // console.log(`Jami has created ${cnt} notes`)
});

router.put("/:username", tokenExtractor, isAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });

    if (user) {
      user.disabled = req.body.disabled;
      await user.save();
      res.json(user);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
});

module.exports = router;
