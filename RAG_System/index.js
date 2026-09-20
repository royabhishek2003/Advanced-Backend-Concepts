import express from "express"
import dotenv from "dotenv"
import { ChatGroq } from "@langchain/groq"
import fs from "fs"
import {PDFParse} from "pdf-parse"
import{RecursiveCharacterTextSplitter} from "@langchain/textsplitters"


dotenv.config();

const app= express();


dotenv.config();
app.use(express.json()); 

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature:0,  // jitna kam temprature rakhenge llm utna serius rhega aur temrature jyada rakhne pr model creative type answer dega 
    maxRetries: 2,  // 
    maxTokens:1000
})

app.post("/ai", async(req, res)=>{
    try{
        const {input}= req.body;
        const response = await llm.invoke([
                    {
                        role:"system",
                        content:"you are a ai assistant so give answer accordingly "
                    },
                    {role:"human",
                        content:input
                    }
                ])
        return res.status(200).json({
            "reply":response.content
        })
    }catch(error){
        return res.status(500).json({"message":`Internal Server Error ${error}`});
    }
})      

const upload = async() =>{
    const pdfpath= "./knowledge.pdf";
    const buffer= fs.readFileSync(pdfpath); // buffer -> stores raw binary data 
    // const data = fs.readFileSync('example.txt', 'utf8'); // here data is retured as a string 
    const pdfResult= new PDFParse({data:buffer});
    const result= await pdfResult.getText();
    const text= result.text;
    const splitter= new RecursiveCharacterTextSplitter({
        chunkSize: 500,
    })
    const docs= await splitter.createDocuments([text]);
    console.log(docs);
}

upload();


app.listen(process.env.PORT, ()=>{
    console.log("Server is started");
})