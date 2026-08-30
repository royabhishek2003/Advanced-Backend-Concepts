import express from "express";
import dotenv from "dotenv";
import connectDb from './lib/db.js';
import User from "./model/user.model.js"
import Redis from "ioredis";
dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());


// create a intsance of redis 
const redis = new Redis(process.env.REDIS_URL) ;

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "hello from redis",
  });
});

app.get("/withredis",async( req, res)=>{
    try{
        const user= await User.find({});
        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            "Message":"Error while fetching user",
            "Errpr":`${error}`
        })
    }
   
})      

app.post("/create",async (req,res)=>{

    try{
        const {name,email,password}= req.body;
        const user= await User.create({name,email,password});
        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            "Message":"Error while creating user",
            "Error":`${error}`

        })
    }
    
})

app.get("/get",async (req,res)=>{
    try{
        const user= await User.find({});
        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            "Message":"Error while fetching user",
            "Errpr":`${error}`
        })
    }
   
    
})
app.listen(port, () => {
    connectDb();
  console.log(`server started ${port}`);
});
