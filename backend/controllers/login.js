const parents = require("../models/parents.json");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

require("dotenv").config();

const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        // Validation
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const found = parents.filter(el => el.email.toLowerCase() === email.toLowerCase());
        if (found.length == 0) return res.send({
            message: "User not found"
        })

        if (found[0].email.toLowerCase() === email.toLowerCase()) {
            const comparePass = await bcrypt.compare(password, found[0].password);
            if (comparePass) {

                // JWT
                const id = found[0].id;
                const payload = {
                    id,
                    email
                };

                const token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                return res.send({
                    message: "Login Successfull",
                    token
                })
            }


            return res.send({
                message: "Login Failed"
            })

        }


    } catch (error) {
        console.error(error);

       next(error);
    }
};

module.exports = { login };