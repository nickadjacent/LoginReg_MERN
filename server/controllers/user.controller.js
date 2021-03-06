const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// export an object that is full of methods
module.exports = {
    register(req, res) {
        User.findOne({ email: req.body.email })
            .then((userExists) => {
                if (userExists) {
                    res.status(400).json({ msg: 'Email already exists.' })
                } else {
                    const user = new User(req.body);

                    user
                        .save()
                        // all validations and bcrypt hashing done before save function is called in the 'user' const above
                        .then(() => {
                            res.json({ msg: 'Success!', user: user });
                        })
                        .catch((err) => res.status(400).json(err));
                }
            })
            .catch((err) => res.json(err))
    },

    login(req, res) {
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (user === null) {
                    res.status(400).json({ msg: "Invalid login attempt!" });
                } else {
                    bcrypt
                        .compare(req.body.password, user.password)
                        .then((passwordIsValid) => {
                            if (passwordIsValid) {
                                res
                                    .cookie(
                                        "usertoken",
                                        jwt.sign({ _id: user._id }, process.env.JWT_SECRET),
                                        {
                                            httpOnly: true,
                                        }
                                    )
                                    .json({ msg: `Success! ${user.username} logged in.` });
                            } else {
                                res.status(400).json({ msg: "Invalid login attempt!" });
                            }
                        })
                        .catch((err) =>
                            res.status(400).json({ msg: "Invalid login attempt!" })
                        );
                }
            })
            .catch((err) => res.json(err));
    },

    logout(req, res) {
        res
            .cookie("usertoken", jwt.sign({ _id: "" }, process.env.JWT_SECRET), {
                httpOnly: true,
                maxAge: 0,
            })
            .json({ msg: "ok" });
    },

    getAll(req, res) {
        User.find()
            .then((users) => res.json(users))
            .catch((err) => res.json(err));
    },


    getLoggedInUser(req, res) {
        const decodedJWT = jwt.decode(req.cookies.usertoken, { complete: true });

        User.findById(decodedJWT.payload._id)
            .then((user) => res.json(user))
            .catch((err) => res.json(err));
    },


    delete(req, res) {
        User.findByIdAndDelete(req.params.id)
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json(err));
    },




    // ------- Not Used -------



    logout2(req, res) {
        res.clearCookie("usertoken");
        res.json({ msg: "usertoken cookie cleared" });
    },


    getOne(req, res) {
        User.findOne({ _id: req.params.id })
            .then((user) => res.json(user))
            .catch((err) => res.json(err));
    },
};