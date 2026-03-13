const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({

  /* ================= CHAT ================= */

  chatId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Chat",
    required:true,
    index:true
  },

  /* ================= SENDER ================= */

  sender:{
    type:String,
    enum:["user","bot","agent","system"],
    required:true
  },

  senderId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    default:null
  },

  /* ================= MESSAGE ================= */

  message:{
    type:String,
    trim:true,
    default:""
  },

  /* ================= MESSAGE TYPE ================= */

  type:{
    type:String,
    enum:["text","quick_reply","image","file","system"],
    default:"text"
  },

  /* ================= ATTACHMENTS ================= */

  attachments:[
    {
      url:String,
      type:String,
      name:String,
      size:Number
    }
  ],

  /* ================= DELIVERY STATUS ================= */

  status:{
    type:String,
    enum:["sent","delivered","read"],
    default:"sent"
  },

  /* ================= BOT PAYLOAD ================= */

  payload:{
    type:mongoose.Schema.Types.Mixed,
    default:null
  },

  /* ================= METADATA ================= */

  meta:{
    ip:String,
    device:String
  }

},{
 timestamps:true
})

/* ================= INDEXES ================= */

messageSchema.index({ chatId:1, createdAt:1 })
messageSchema.index({ sender:1 })
messageSchema.index({ createdAt:-1 })

module.exports =
 mongoose.models.Message ||
 mongoose.model("Message",messageSchema)