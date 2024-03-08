const mongoose = require("mongoose");
const {isEmail}= require("validator");
const bcrypt = require("bcrypt");
const UserSchema = mongoose.Schema({
    email:{
        type:String,
        required: [true,"email is required"],
        unique: true,
        validate: [isEmail , "email must  be valid email"]
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minLength:[6,"password should be of atleast 6 character long "],

    },
    name:{
        type:String,
        unique:true,
        required:[true,"name is required"],
        minLength:[2,"name must be 2 character long"],
    }
});

// mongoose pre/ post hooks
UserSchema.pre("save",async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

// static method
UserSchema.statics.login = async function(email,password){
    const user = await User.findOne({email});

    if(!user){
        throw Error("email not registered");
    }
    // verify the password
    const passwordMatched = await bcrypt.compare(password,user.password);
    if(!passwordMatched){
        throw Error("password incorrect");
    }

    return user;

}

const User = mongoose.model("user",UserSchema);
module.exports=User;
