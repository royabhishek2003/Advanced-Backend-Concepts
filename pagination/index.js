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

// pagination using mongoose-paginate-v2(inbuilt method )

app.get("/paginateddata",async (req,res)=>{
    try{
        const {page=1,limit=3}= req.query;

        const options= {
            page:parseInt(page),
            limit:parseInt(limit)
        }
        const result= await User.paginate({},options);
        return res.status(200).json({
           "result": result.docs,
           "Total document": result.totalDocs,
           "TotalPage":result.totalPages,
           "CurrentPage":result.page,
           "haspreviouspage":result.hasPrevPage,
           "hasnextPage":result.hasNextPage,
           "previousPage":result.prevPage,
           "nextPage":result.nextPage
        })
    }
    catch(error){
        console.logo(`Error while fetchiung data: ${error}`);
    }
})

// pagination without using inbuilt npm 
// by ourself 
app.get("/paginated-data", async(req, res)=>{
    try{
       
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip= (page-1)*limit;
        const total= await User.countDocuments();
        const result = await User.find().skip(skip).limit(limit);
        return res.status(200).json({
            "Totalrecords":total,
            "Totalpages":Math.ceil(total/limit),
            "page":page,
            "limit":limit,
            result
        })
    }
    catch(error){
        console.log(`error while fetching user records: ${error}`)
        return res.status(500).json({
            "Message":"Internal Server Error"
        });
    }
})

dbConn();
app.listen(process.env.PORT,()=>{
    console.log('Server is Running');
})




