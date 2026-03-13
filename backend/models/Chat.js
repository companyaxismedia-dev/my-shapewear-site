const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({

  /* ================= USER ================= */
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true
  },

  /* ================= ORDER ================= */
  orderId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Order",
    required:true,
    index:true
  },

  /* ================= CHAT TYPE ================= */

  mode:{
    type:String,
    enum:["bot","agent"],
    default:"bot"
  },

  /* ================= CHAT STATUS ================= */

  status:{
 type:String,
 enum:["bot","ai","agent","closed"],
 default:"bot"
},

  /* ================= ASSIGNED AGENT ================= */

  assignedAgent:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    default:null
  },

  /* ================= LAST MESSAGE ================= */

  lastMessage:{
    type:String,
    default:""
  },

  lastSender:{
    type:String,
    enum:["user","bot","agent"],
    default:"bot"
  },

  /* ================= UNREAD COUNT ================= */

  unreadUser:{
    type:Number,
    default:0
  },

  unreadAgent:{
    type:Number,
    default:0
  },

},{
 timestamps:true
})

module.exports =
 mongoose.models.Chat ||
 mongoose.model("Chat",chatSchema)