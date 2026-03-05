const { default: mongoose } = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {type: String, required:true},
    slug: {type: String, required: true, unique: true},
    image: String,
    description: String,
    metaTitle: String,
    metaDescription: String,
    mataKeywords: [String],
    isActive: {type: Boolean, default:true},
},{
    timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);