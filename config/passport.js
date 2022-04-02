const  LocalStrategy = require('passport-local').Strategy;
const AdminModel = require('../model/admin')
const bcrypt = require('bcryptjs')
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')
const Cookie = require('cookie-parser')

module.exports = function(passport){
    passport.use(new LocalStrategy({usernameField:'email'}, (email, password, done)=>{

        // Match user
        AdminModel.findOne({email:email})
            .then(user => {
                if(!user){
                    return done(null, false, {message: "User do not exist"})
                }
                    // Match Password
                    bcrypt.compare(password, user.password, (err, isMatch) =>{
                        if(err) throw err;
                        if(isMatch){
                            return done(null, user)
                        }else{
                            return done(null, false, {message: "Incorrect Password"})
                    }
                })
            })
    }));

    passport.serializeUser((user, done) =>{
        done(null, user.id)
    })

    passport.deserializeUser((id, done) =>{
        AdminModel.findById(id, (err, user) =>{
            done(err, user);
            localStorage.setItem('adminData', JSON.stringify(user))
        })
    })
}

