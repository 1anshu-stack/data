import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';


import User from "../models/user.mjs"
import { getUserStatus, login } from "../controllers/auth.js"



describe('Auth Controller - Login', function () {

    before(function (done) {
        const uri = `mongodb+srv://Anshu11228:Anshu11228@cluster0.7p6vf67.mongodb.net/test-messages?retryWrites=true&w=majority&appName=Cluster0`
        const dbName = 'mern'


        mongoose
            .connect(
                `${uri}/${dbName}`
            )
            .then(result => {
                const user = new User({
                    email: 'test@test.com',
                    password: 'tester',
                    name: 'Test',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                });
                return user.save();
            })
            .then(() => {
                done();
            })
    })


    it('should throw an error with code 500 if accessing the database fails', function (done) {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@gmail.com',
                password: 'tester'
            }
        };

        login(req, {}, () => { }).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        });

        User.findOne.restore()
    })


    // Set up a testing environment for mongoDB, where you use a dedicated testing database because that's important.
    // You definitely don't want to use your production database for testing.
    it('should send a response with a valid user status for an existing user', function (done) {
        const req = { userId: '5c0f66b979af55031b34728a' }
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status;
            }
        };
        getUserStatus(req, res, () => { }).then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal('I am new!')
            done()
        })
    })


    after(function (done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            })
    })
})