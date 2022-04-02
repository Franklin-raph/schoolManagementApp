const express = require('express')
const nodemailer = require('nodemailer')
const router = express.Router()
const store = require('store')
const AdminModel = require('../model/admin')
const StudentModel = require('../model/student')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')
const {ensureAuthenticated} = require('../helpers/auth')


router.get('/adminLogin', (req, res) => {

  const userData = JSON.parse(localStorage.getItem('userData'))
  res.render('admin/adminLogin',{userData: userData})
})

router.get('/addStudent', ensureAuthenticated, (req, res) => {
  const adminData = JSON.parse(localStorage.getItem('adminData'))
  res.render('admin/addStudent', {adminData: adminData})
})

router.get('/updateStudent/:id', async (req, res) => {
  const studentData = await StudentModel.findById(req.params.id)
  console.log("***************************************************")
  console.log(studentData)
  console.log("***************************************************")
  res.render("admin/updateStudent", {studentData: studentData})
})


router.put('/updateStudent/:id', (req, res) => {
  // res.send("Updated")
  console.log("Reached here")
  StudentModel.findById(req.params.id)
    .then(result => {
      result.name = req.body.name;
      result.email = req.body.email;
      result.phone = req.body.phone;
      result.DOB = req.body.DOB;
      result.gender = req.body.gender;
      result.course = req.body.course;
      console.log(result)

      result.save()
        .then(result => {
          req.flash("success_msg", "Student data has been updated successfully")
          res.redirect('/admin/studentsRecords')
        })
    })
})

router.post('/addStudent', (req, res) => {
  const data = req.body

  console.log(res.json)
  
    StudentModel.findOne({email: req.body.email})
      .then(user => {
        if(user){
          req.flash('error_msg', "Email already exists")
          res.redirect('addStudent')
        }else{
          const newStudent = new StudentModel({
            name: req.body.name,
            email: "stu"+req.body.email,
            DOB: req.body.DOB,
            phone: req.body.phone,
            gender: req.body.gender,
            course: req.body.course,
          }).save()
            .then((user) => {
              req.flash('success_msg', "Student Registered successfully")
              res.redirect('/admin/studentsRecords')
              // console.log(user.json)
            }).catch(err => console.log("Error occured while creating student "+err))
          console.log(newStudent)
        }
      })
})

router.get('/studentsRecords', (req, res)=>{
  StudentModel.find().sort({createdAt: -1})
    .then((student) => {
      const adminData = JSON.parse(localStorage.getItem('adminData'))
      res.render('admin/studentsRecords', {adminData: adminData, studentData: student})
    }).catch(err=> console.log(err+" an error occured"))
})

router.post('/adminLogin', (req, res, next) => {

  console.log("============================")
  console.log(req.body)
  console.log("============================")
  
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/adminLogin',
    failureFlash: true,
  })(req, res, next)

  const userDatas = JSON.parse(localStorage.getItem('adminData'))
  console.log(userDatas)
  console.log("************************************************")
  
});

// Logout functionality
router.get('/logout',ensureAuthenticated, (req, res) => {
  req.logOut()
  req.flash("success_msg", "You have successfully logged out")
  res.redirect('/admin/adminLogin')
})

router.get('/dashboard', ensureAuthenticated, (req, res) =>{
  const adminData = JSON.parse(localStorage.getItem('adminData'))
  res.render('admin/dashboard', {adminData: adminData})
});

router.get('/accountSettings', ensureAuthenticated, (req, res) =>{
  const userData = JSON.parse(localStorage.getItem('adminData'))
  res.render('admin/accountSettings', {adminData: adminData})
});


router.get('/adminOTP', (req, res) => {

  const generatedCode = Math.floor(100000 + Math.random() * 900000);
  store.set('digitCode',generatedCode)

  // Code for sending email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'franklinchinedu61@gmail.com',
          pass: 'franklinchinedu@7'
        }
      });
      
      const mailOptions = {
        from: 'franklinchinedu61@gmail.com',
        to: 'igboekwulusifranklin@gmail.com',
        subject: 'Sending Email From Express App',
        html: `<h1>Your code is: <br />${generatedCode}</h1>`,
      };
      
      transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
          console.log(error + "Error here");
        } else {
          console.log('Email sent: ' + info.response);
          console.log(info)
        }
      });
      res.render('admin/adminOTP', { generatedCode: generatedCode })
})


router.get('/register', (req, res) => {
  res.render('admin/register')
})


router.post('/register', (req, res) => {

  const sentCode = store.get('digitCode')
  const codeNum = parseInt(req.body.OTP)
  

  if(req.body.password !== req.body.password2){
    req.flash('error_msg', "Password fields didn't match")
    res.redirect('register')
  }else if(req.body.password.length < 4){
    req.flash('error_msg', "Password must be at least 4 characters")
    res.redirect('register')
  }else if(codeNum !== sentCode){
    req.flash('error_msg', "Incorrect OTP")
    res.redirect('register')
  } else {
    AdminModel.findOne({email: req.body.email})
      .then(user => {
        if(user){
          req.flash('error_msg', "Email already exists")
          res.redirect('register')
        } else {
          const newAdmin = new AdminModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            DOB: req.body.DOB,
            phone: req.body.phone,
            role: req.body.role,
            gender: req.body.gender,
            status: req.body.status,
          })

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAdmin.password, salt, (err, hash) => {
              if(err) throw err;
              newAdmin.password = hash;
              newAdmin.save()
                .then(() => {
                  req.flash('success_msg', "Registeration was successful")
                  res.redirect('/admin/adminLogin')
                })
                .catch(err => {
                  console.log("An error occured while creating user "+ err)
                })
            })
          })
          console.log(newAdmin)
        }
      })
  }

  
  let adminData = req.body
  console.log(adminData)
  

  console.log(sentCode)
  console.log(codeNum)
  console.log(req.body.OTP)
  store.clearAll()
})

router.post('/adminOTP/', (req, res) => {
  const sentCode = store.get('digitCode')
  const codeNum = parseInt(req.body.OTP)
  if(codeNum === sentCode){
      res.redirect('/admin/register')
  } else {
      req.flash('error_msg', 'Incorrect OTP')
      res.redirect('/admin/adminLogin')
  }
})

// delete student data
router.delete('/students/:id', async (req, res) => {
  await StudentModel.findByIdAndDelete(req.params.id)
    try {
      req.flash('success_msg', 'Student data deleted successfully')
      res.redirect('/admin/studentsRecords')
    } catch (error) {
      console.log("Student data was not deleted with the error "+ err)
    }
})

// router.get('/students/:id', (req, res) =>{
//   res.send("user details")
// })

module.exports = router


