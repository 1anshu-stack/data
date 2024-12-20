import authMiddleware from "../middleware/is-auth.js"
import { expect } from 'chai';
import sinon from 'sinon'
import jwt from 'jsonwebtoken'



describe('Auth middleware', function () {
    // we really get error when we does not have header
    it('should throw an error if no authorization header is present', function () {
        const req = {
            get: function (headername) {
                return null;
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Not authentication')
    });



    it('should throw an error if the authorization header is only one string', function () {
        const req = {
            get: function (headerName) {
                return 'xyz'
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw()
    })



    it('should yield a userId after decoding the token', function(){
        const req = {
            get: function(headerName){
                return 'Bearer dafsdgajgheiaksdfn'
            }
        };
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({userId: 'abc'});
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });



    it('should throw an error if the token cannot be verified', function() {
        const req = {
            get: function(headerName){
                return 'Bearer xyz'
            }
        };
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()
    })
});



