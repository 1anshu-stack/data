import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';



import User from "../models/user.mjs"
import { createPost } from "../controllers/feed.js"



describe('Feed Controller', function () {

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


    beforeEach(function () {})

    afterEach(function () {})


    it('should add a created post to the posts of the creator', function (done) {

        const req = {
            body: {
                title: 'Test Post',
                content: 'A Test Post'
            },
            file: {
                path: 'abc'
            },
            userId: '5c0f66b979af55031b34728a'
        };

        const res = { 
            status: function() {
                return this;
            }, 
            json: function() {} 
        };


        createPost(req, res, () => {})
        .then((savedUser) => {
            expect(savedUser).to.have.property('posts');
            expect(savedUser.posts).to.have.length(1);
            done();
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