const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const Otp = require("../models/otpModel");
const secretKey = "1@amit#00-+";
const maxAge = 1 * 60 * 60 * 24; // one day in seconds

const handleErrors = function (err) {
  let errors = { email: "", name: "", password: "" };

  //   console.log(err.message);
  // login error handling
  if (err.message === "email not registered") {
    errors["email"] = err.message;
    return errors;
  } else if (err.message === "password incorrect") {
    errors["password"] = err.message;
    return errors;
  }

  // signup errors handling
  // unique -> error
  if (err.code) {
    if (err.keyValue.name) {
      errors.name = "name is already used";
    }
    if (err.keyValue.email) {
      errors.email = "email is already used";
    }

    return errors;
  }

  //rest other errors

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const createToken = function (id) {
  return jwt.sign({ id }, secretKey, {
    expiresIn: maxAge,
  });
};

module.exports.get_login = function (req, res) {
  res.render("authUser/login", { title: "login" });
};
module.exports.get_signup = function (req, res) {
  res.render("authUser/signup", { title: "signup" });
};
module.exports.post_login = async function (req, res) {
  // check user not exist
  // validate the email and password
  // both are deligated to User Model
  try {
    const { email, password } = req.body;
    const user = await User.login(email, password);

    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json(user._id);
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json(error);
  }
};

module.exports.post_signup = async function (req, res) {
  // console.log(req.body);
  try {
    const { name, email, password } = req.body;
    // console.log(name,email,password);
    const user = await User.create({ email, password, name });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json(user._id);
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json(error);
  }
};
module.exports.get_logout = function (req, res) {
  res.cookie("jwt", "", { maxAge: 0 });
  res.redirect("/");
};

module.exports.get_profile = function (req, res) {
  res.render("profile.ejs", { title: "profile" });
};

module.exports.get_forget_password = function (req, res) {
  res.render("authUser/forgetPassword.ejs", { title: "forgetPassword" });
};

const generateOTP = function () {
  // Generate a secret
  const secret = speakeasy.generateSecret();

  // Get the OTP based on the secret
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
    algorithm: "sha256",
  });
  return otp;
};


// send email 

const sendEmail = async (email, subject, text) => {
  try {
      const transporter = nodemailer.createTransport({
          service: process.env.SERVICE,
          auth: {
              user: "gladiatorpandey@gmail.com",
              pass: process.env.PASS,
          },
      });
      console.log(process.env.USER);
      console.log(process.env.PASS);

      await transporter.sendMail({
          from: "gladiatorpandey@gmail.com",
          to: email,
          subject: subject,
          text: text,
      });

      console.log("email sent sucessfully");
  } catch (error) {
      console.log(error, "email not sent");
  }
};

module.exports.post_generateOtp = async function (req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if(!user){
      throw Error("Invalid email");
    }
    const otp = generateOTP();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ( 1 * 60 * 60 * 1000));
    const newOtpUser = { 
      email: email,
      otp: otp,
      createdAt: createdAt,
      expiresAt: expiresAt,
    };
    // console.log(newOtpUser);
    await Otp.findOneAndUpdate({ email }, newOtpUser, { upsert: true });
    const subject = 'Forget password : OTP ';
    const text = `your OTP is ${otp} , will expire in 1 hour.`;
    sendEmail(email,subject,text);
    res.status(200).json({success:true,msg:`OTP sent to ${email}`});
  } catch (err) {
    // const error = handleErrors(err);
    // console.log(err.message);
    res.status(400).json({success:false,error:err.message});
  }
};


module.exports.post_verifyOtp = async function(req,res){
    const otpValue = req.body.otpValue;
    try{
      // static method to compare
      const user = await Otp.findOne({otp:otpValue});
      if(!user){
        throw Error("Invalid OTP");
      }
      const currentTime = new Date();
      const otpExpireTime = user.expiresAt;
      if(currentTime>otpExpireTime){
        throw Error("OTP expired !!! ");
      }
      res.status(200).json({success:true,msg:"Create new Password"});
      
    }catch(err){
      // console.log(err.message);
      res.status(400).json({success:false,error:err.message});
    }
}

module.exports.get_createNewPassword = function(req,res){
  const useremail = req.params.email;
  console.log("hello",useremail);
  res.render("authUser/createNewPassword",{title:"New Password"});
}