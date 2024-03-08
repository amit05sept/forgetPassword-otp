const mongoose = require("mongoose");

const port = 3000;
const mongoUrl = process.env.MONGO_URL;

async function connectToDB(app){
    try{
        await mongoose.connect(`${mongoUrl}`);
        console.log("connected to DB...");

        app.listen(port,()=>{
            console.log("Server Started...");
        });
    }catch(err){
        console.log(err);
    }
}


module.exports=connectToDB;