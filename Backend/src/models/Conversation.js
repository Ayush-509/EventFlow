// models/Conversation.js

import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
{
    event:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        required:true
    },

    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    organizer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},
{timestamps:true}
);

export default mongoose.model("Conversation",conversationSchema);