

const sendEmail = async(email)=>{
    await new Promise((resolve)=>{
        setTimeout(()=>{
            return resolve();
        },5000)
    })

    console.log("Task Completed")
}

export default sendEmail;