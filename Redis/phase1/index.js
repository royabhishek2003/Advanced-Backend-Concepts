import express from "express";
import dotenv from "dotenv";
import connectDb from './lib/db.js';
import User from "./model/user.model.js"
import rateLimiter from "./middleware/rateLimiting.js"
import redis  from "./lib/redis.js"
import sendEmail from "./lib/sendEmail.js"
import emailQueue from "./queue.js"

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());

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


// BULLMQ -> EK Radis based queue management library hai jo background jobs handle karta hai

app.post("/create",async (req,res)=>{

    try{
        const {name,email,password}= req.body;
        redis.del("user:all");
        const user= await User.create({name,email,password});
        //  await sendEmail(); // wait for the task to complete 
        await emailQueue.add("send-email",{email}); // email queue ke andar ek job add ho gya hai jo worker consume karega 
 
        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json({
            "Message":"Error while creating user",
            "Error":`${error}`

        })
    }
    
})

// Rate liming using Redis 
app.get("/get", rateLimiter , async (req,res)=>{
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

// we have learn API Caching now we store the otp for some time like 1,2 minutes 


// get the otp and store unique otp for a emailid 
app.post("/get-otp",async(req,res)=>{
    const {email}= req.body;  
    const otp= Math.floor(100000 + Math.random()*900000 ).toString();
    await redis.set(`otp:${email}`,otp,"EX", 50);

    return res.status(200).json({
        "otp":otp
    })
})

// verify the otp
app.post("/verify-otp", async(req, res)=>{
    try{
        const {email, otp}= req.body;
        if(!otp){
            return res.status(400).json({
                "message":"Please send latest otp"
            })
        }
        const cachedotp= await redis.get(`otp:${email}`);
        if(!cachedotp ){
            return res.status(400).json({
                "message":"OTP Expired"
            })
        }
        if(cachedotp == otp){
            await redis.del(`otp:${email}`);
            return res.status(201).json({
                "Message":"Otp is verifid"
            })
        }
        return res.status(401).json({
            "message":"Incorrect  otp"
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            "Error":`Error is ${error}`
        })
    }
})
 







app.listen(port, () => {
    connectDb();
  console.log(`server started ${port}`);
});
