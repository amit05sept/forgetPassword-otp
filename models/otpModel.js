const mongoose= require("mongoose");
const otpSchema = mongoose.Schema({
    email:{
        type:String,
        ref:"user",
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    },
    expiresAt:{
        type: Date,
    }
});




const Otp = mongoose.model("otp",otpSchema);
module.exports=Otp;