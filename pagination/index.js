import express from "express"
import dotenv from "dotenv"
import {dbConn} from "./config/dbConnect.js"
import User from "./models/user.model.js"

const app= express();
dotenv.config();
app.use(express.json());

app.get("/",(req, res)=>{
    return res.json({
        "Message": "Server is Running"
    })
})
app.post("/create", async (req, res)=>{
    try{
        const {name,email,password}= req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                "Message":"Missing Feild All Feild are mecceary"
            })
        }

        const user= await User.create({
            name,
            email,
            password
        })

        return res.status(201).json({
            "message":"User created",
            user
        })

    }
    catch(error){
        console.log(`Error while creating user: ${error}`);
    }
})

app.get("/data",async (req,res)=>{
    try{
    
        const alldata= await User.find({});
        return res.status(200).json({
            "Message":"All data",
            alldata
        })

    }
    catch(error){
        console.logo(`Error while fetchiung data: ${error}`);
    }
})


app.get("/paginateddata",async (req,res)=>{
    try{
        

    }
    catch(error){
        console.logo(`Error while fetchiung data: ${error}`);
    }
})
dbConn();
app.listen(process.env.PORT,()=>{
    console.log('Server is Running');
})




