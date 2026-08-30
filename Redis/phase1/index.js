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
const redis = new Redis(process.env.REDIS_URL);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "hello from redis",
  });
});

app.get("/getwithredis",async( req, res)=>{
    try{
        // jab naya user create hoga tab bhi ye purana hi sare uesers ko return karega 
        // isliye jab naya user koi create ho tab redis ks "user:all" key ko delete kr
        //  denge taki pehli baar cache miss ho aur updated value present ho redis me 
        const cached= await redis.get("user:all");

        if(cached){
            const user = JSON.parse(cached);
            return res.status(200).json(user);
        }
        const user= await User.find({});

        await redis.set("user:all",JSON.stringify(user));

        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            "Message":"Error while fetching user",
            "Error":`${error}`
        })
    }
   
})      

app.post("/create",async (req,res)=>{

    try{
        const {name,email,password}= req.body;
        redis.del("user:all");
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

// we have learn API Caching now we store the otp for some time like 1,2 minutes 


   
    
})
app.listen(port, () => {
    connectDb();
  console.log(`server started ${port}`);
});
