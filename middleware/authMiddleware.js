const jwt = require("jsonwebtoken");
const secretKey="1@amit#00-+";
const User = require("../models/userModel");


function authUser(req, res, next) {
    // jwt -> present  // not present -> redirect to login
    const token = req.cookies.jwt;
    if(!token){
      res.redirect("/user/login");
      return;
    }
    jwt.verify(token , secretKey,(err,data)=>{
      if(err){
        res.redirect("/user/login");
        return;
      }else{
        // jwt -> verified // redirect to next
        next();
      }
    });
}

const checkUser = function(req,res,next){
  const token = req.cookies.jwt;
  if(!token){
    res.locals.user=null;
    next();
  }
  jwt.verify(token, secretKey,async function(err,data){
    if(err){
      res.locals.user=null;
      next();
    }else{
      const user = await User.findById(data.id);
      res.locals.user = user;
      next();
    }
  });
}

module.exports = {
  authUser,
  checkUser,
};
