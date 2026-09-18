import express from "express"
import dotenv from "dotenv"
import {GoogleGenAI} from "@google/genai"
import { ChatGroq } from "@langchain/groq"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MessagesAnnotation, StateGraph,Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { TavilySearch } from "@langchain/tavily";


const app = express();


dotenv.config();
app.use(express.json()); 

// without langchain

// making a LLM call using SDK's

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// });
// // no real time data and no meory just stateless 
// const main = async(input) =>{
//      try{
//         const response = await ai.models.generateContent({ 
//         model:"gemini-3.5-flash",
//         contents:[
//             {role:"system",
//                 parts:[{text:"you are an assistant and your name is jarvis. If you don't kow the answer don't give wrong answer"}]
//             },  
//             {role:"user",
//                 parts:[{text:input}]
//             }
//         ]
//      })
//         return response;
//      }
//      catch(error){
//         console.log(`Error occured while calling geminiai ${error}`);
//      }
// }




// without langchain 

// app.post("/ai", async(req, res)=>{
//     try{
//         const {input}= req.body;
//         const response= await main(input);
//         if(response.text){
//             return res.status(200).json(response.text);
//         }
//         return res.status(500).json({
//             "Message":"Sorry i can not help in this matter"
//         })
//     }catch(error){
//         return res.status(500).json({"message":"Internal Server Error"});
//     }
    
// })


app.get("/",(req,res)=>{
    return res.status(200).json({
        "message":"Hello from level1"
    })
})


// with langchain 

// now we need to create a tool node so that ai can use that tool 

const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});


const tools=[tool]
const toolNode= new ToolNode(tools);


const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temrature:0,  // jitna kam temprature rakhenge llm utna serius rhega aur temrature jyada rakhne pr model creative type answer dega 
    maxRetries: 2,  // 
    maxTokens:100
}).bindTools(tools);


const aksai = async(input) => {
    const aiMsg = await llm.invoke([
    [
        "system",
        "You are a Assistant your name is Jarvis. If you don't know anything call the relevant tools",
    ],
    ["human", input],
])
    return aiMsg;
}



// make a custom state for langgraph 

// const State = Annotation.Root({
//     prompt:Annotation, // annotation -> stores the value return by the most recent node 
//     aiMsg:Annotation
// })




const callLLM= async(state)=>{
    try{
        // console.log("state: ",state);
        const input = state.messages[0].content;
        const response = await aksai(input)
        return {
            messages:[response]
        }
    }catch(error){
        throw new Error(`LLM call failed: ${error.message}`);
}}

const shouldContinue= async(state)=>{

    const lastMessage= state.messages[state.messages.length -1];
    if(lastMessage.tool_calls.length > 0){
        return "tools";
    }else{
        "__end__"
    }
}

const graph = new StateGraph(MessagesAnnotation)
                .addNode("agent",callLLM)
                .addNode("tools",toolNode)
                .addEdge("__start__","agent")
                .addEdge("tools","agent")
                .addConditionalEdges("agent",shouldContinue)
                .compile()



app.post("/ai", async(req, res)=>{
    try{
        const {input}= req.body;
        const response = await graph.invoke({messages:[
            {role:"human",
                content:input
            }
        ]})
        console.log(response);
        const aimessageidx= response.messages.length -1;
        return res.status(200).json({
            "reply":response.messages[aimessageidx].content
        })
    }catch(error){
        return res.status(500).json({"message":`Internal Server Error ${error}`});
    }
    
})               

app.listen(process.env.PORT, ()=>{
    console.log("Server is started");
})