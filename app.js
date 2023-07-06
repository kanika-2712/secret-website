//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
const encrypt=require("mongoose-encryption");
const app = express();
const semver = require('semver');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
run();

async function run(){

    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
    const userSchema = new  mongoose.Schema({
        email:String,
        password:String
    });

   
    userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

    const User = new mongoose.model("User",userSchema)

    app.get("/",function(req,res){
    res.render("home");

    })

    app.get("/login",function(req,res){
    res.render("login");
    
    })

    app.get("/register",function(req,res){
    res.render("register");
    
    })

    app.post("/register", (req, res) => {
        // Before saving any new entries, make sure that the same {email-id} doesn't exist twice
 
        const user_requested_email = req.body.username;
 
        User.find({ email: user_requested_email })
            .then((foundList) => {
                // console.log(foundList);
                // console.log(foundList.length);
 
                if (foundList.length === 0) {
                    const newUser = new User({
                        email: req.body.username,
                        password: req.body.password,
                    });
                    newUser.save();
                    res.render("secrets");
                } else {
                    res.send("Email Already exists");
                }
            })
            .catch((err) => {
                res.send(`Error Finding Email: ${err}`);
            });
    });

    app.post("/login",async(req,res)=>{
        const username = req.body.username;
        const password = req.body.password;
 
        try {
            const foundName = await User.findOne({email:username})
            if(foundName){
                if(foundName.password===password){
                    res.render('secrets');
                }else{
                    console.log('Password Does not Match...Try Again !')
                }
            }else{
                console.log("User Not found...")
            }
        } catch (err) {
            console.log(err);
        }
    });

    app.listen(3000,function(){
    console.log("server startes on port 3000");
    });
}
