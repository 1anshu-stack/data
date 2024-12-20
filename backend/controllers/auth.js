import User from '../models/user.mjs'
import { validationResult } from 'express-validator';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



export const signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const email = req.body.email
    const name = req.body.name
    const password = req.body.password

    bcrypt
        .hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });
            return user.save();
        })
        .then(result => {
            res.status(201)
                .json({
                    message: 'User created',
                    userId: result._id
                })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}


export const login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'somesupersecretsecret',
            { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        return;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        return err;
    }
};


export const getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ status: user.status });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};