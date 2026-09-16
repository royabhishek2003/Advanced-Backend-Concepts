import mongoose from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2"  // first step

const userSchema = new mongoose.Schema({
    name:"String",
    email:"String",
    password:"String"
},{timestamp:true});

mySchema.plugin(mongoosePaginate);  // second step

const User= mongoose.model("User",userSchema);


export default User;

