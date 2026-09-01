import {Queue,Worker} from "bullmq";
import redis from "./lib/redis.js"
import sendEmail from "./lib/sendEmail.js"

const worker = new Worker("emailQueue", async (job)=>{
        console.log("Job Started");
        const email= job.data;
        await sendEmail(email);
        console.log("job Completed")
}, {connection:redis});

export default worker;
 