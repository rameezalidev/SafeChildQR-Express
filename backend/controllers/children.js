const { randomUUID } = require('crypto');
const children = require('../models/children.json');
const parents = require('../models/parents.json');
const fs = require('fs').promises;

const addChildren = async (req, res, next) => {
    try {
        const { name, age, gender, info } = req.body;

        const alreadyExist = children.some(
            el =>
                el.parentId === req.user.id &&
                el.name.toLowerCase() === name.toLowerCase()
        );

        if (alreadyExist) {
            return res.status(409).json({
                message: "Child already exists"
            });
        }

        const id = randomUUID();

        const child = {
            id,
            name,
            age,
            gender,
            info,
            parentId: req.user.id
        };

        children.push(child);

        const updatedParent = parents.map((el) => {
            return el.id === req.user.id
                ? {
                    ...el,
                    children: [
                        ...(el.children || []),
                        id
                    ]
                }
                : el;
        });

        await fs.writeFile(
            "./models/children.json",
            JSON.stringify(children, null, 2)
        );

        await fs.writeFile(
            "./models/parents.json",
            JSON.stringify(updatedParent, null, 2)
        );

        res.status(201).json(child);

    } catch (err) {
        next(err);
    }
};


const getChildren = (req, res, next) => {
    try {
        const parentId = req.user.id;

        const myChildren = children.filter(
            el => el.parentId === parentId
        );

        res.json(myChildren);

    } catch (err) {
        next(err);
    }
};


const getSingleChildren = (req, res, next) => {
    try {
        const parentId = req.user.id;
        const { id } = req.params;

        const child = children.find(
            el =>
                el.parentId === parentId &&
                el.id === id
        );

        if (!child) {
            return res.status(404).json({
                message: "Child not found"
            });
        }

        res.json(child);

    } catch (err) {
        next(err);
    }
};


const deleteChildren = async (req, res, next) => {
    try {
        const parentId = req.user.id;
        const { id } = req.params;

        // Check that child belongs to logged-in parent
        const child = children.find(
            el =>
                el.id === id &&
                el.parentId === parentId
        );

        if (!child) {
            return res.status(404).json({
                message: "Child not found"
            });
        }

        // Remove child
        const myChildren = children.filter(
            el => !(el.parentId === parentId && el.id === id)
        );

        // Remove child ID from parent
        const updatedParent = parents.map(
            el =>
                el.id === parentId
                    ? {
                        ...el,
                        children: (el.children || []).filter(
                            item => item !== id
                        )
                    }
                    : el
        );

        await fs.writeFile(
            "./models/parents.json",
            JSON.stringify(updatedParent, null, 2)
        );

        await fs.writeFile(
            "./models/children.json",
            JSON.stringify(myChildren, null, 2)
        );

        res.json({
            message: "Child deleted!"
        });

    } catch (err) {
        next(err);
    }
};


const updateChild = async (req, res, next) => {
    try {
        const parentId = req.user.id;
        const { id } = req.params;

        const {
            name,
            age,
            gender,
            info
        } = req.body;

        // Check ownership
        const child = children.find(
            el =>
                el.id === id &&
                el.parentId === parentId
        );

        if (!child) {
            return res.status(404).json({
                message: "Child not found"
            });
        }

        // Update child
        const updatedChildren = children.map(el => {
            return el.id === id && el.parentId === parentId
                ? {
                    ...el,
                    name: name ?? el.name,
                    age: age ?? el.age,
                    gender: gender ?? el.gender,
                    info: info ?? el.info
                }
                : el;
        });

        await fs.writeFile(
            "./models/children.json",
            JSON.stringify(updatedChildren, null, 2)
        );

        const updatedChild = updatedChildren.find(
            el => el.id === id
        );

        res.json({
            message: "Child updated successfully",
            child: updatedChild
        });

    } catch (err) {
        next(err);
    }
};


module.exports = {
    addChildren,
    getChildren,
    getSingleChildren,
    deleteChildren,
    updateChild
};
