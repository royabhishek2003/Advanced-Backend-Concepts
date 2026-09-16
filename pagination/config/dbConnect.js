import mongoose from "mongoose"

import dotenv from "dotenv"

dotenv.config()
export const dbConn = async() =>{
        try{
             await mongoose.connect(process.env.MONGODB_URL);
              console.log('Db Connected');
        }
        catch(error){
            console.log(`Error while creating connection with Db ${error}`);

        }
}





