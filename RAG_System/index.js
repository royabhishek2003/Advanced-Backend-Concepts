import express from "express"
import dotenv from "dotenv"
import { ChatGroq } from "@langchain/groq"
import fs from "fs"
import {PDFParse} from "pdf-parse"
import{RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";

dotenv.config();

const app= express();

dotenv.config();
app.use(express.json()); 

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature:0,  // jitna kam temprature rakhenge llm utna serius rhega aur temrature jyada rakhne pr model creative type answer dega 
    maxRetries: 0,  // 
    maxTokens:300
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "grocery-store",
});

app.post("/ai", async(req, res)=>{
    try{
        const {input}= req.body;
        const docs = await vectorStore.similaritySearch(input,3); // search that emedding and send whole chunk(embedding) from vector database 
        const context= docs.map((d) => d.pageContent).join("\n");

console.log("Number of docs:", docs.length);
console.log("Context characters:", context.length);

        const response = await llm.invoke([
                    {
                        role:"system",
                        content:`You are a RAG AI assistant.
                        STRICT RULES:
                        - Answer ONLY from context
                        - Do not use outside knowledge
                        - If answer not found say:
                        "I don't know from uploaded PDF."
                        Context: ${context}` },
                    
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
        chunkOverlap:200 // so that some meaning of last text in the chunk is not missed 
    })
    const docs= await splitter.createDocuments([text]);
   await vectorStore.addDocuments(docs); // autometically vector store store the embdeiing of the docs in quadrant vector db 
}


app.listen(process.env.PORT, ()=>{
    console.log("Server is started");
})