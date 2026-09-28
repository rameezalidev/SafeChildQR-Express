const parents = require("../models/parents.json");
const fs = require("fs").promises;
const { randomUUID } = require("crypto");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

require("dotenv").config();

const signUp = async (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword,
            emergencyContact
        } = req.body;

        // Validation
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        // Check existing user
        const alreadyUser = parents.some(
            el => el.email.toLowerCase() === email.toLowerCase()
        );

        if (alreadyUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Check password
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate ID
        const id = randomUUID();

        // Add user
        parents.push({
            id,
            email,
            password: hashedPassword,
            emergencyContact
        });

        // Save to JSON
        await fs.writeFile(
            "./models/parents.json",
            JSON.stringify(parents, null, 2)
        );


        return res.status(201).json({
            message: "Signup success"
        });

    } catch (error) {
        console.error(error);

        next(error);
    }
};

module.exports = { signUp };