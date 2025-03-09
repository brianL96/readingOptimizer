const mongoose = require("mongoose");


let mongodbConnection = process.env.MONGO_DB_ACCESS || null;

let db = null;
acquireConnection();

async function acquireConnection(){
    db = await mongoose.connect(mongodbConnection);
}

function getDB(){
    return db;
}

let {Schema, model} = mongoose;

let bookInfoSchema = new Schema({
    
    author: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    listDate: {
        type: String,
        required: true
    },

    length: {
        type: Number,
        default: 0
    },

    image: {
        type: String,
        default: "Not Found"
    },

    category: {
        type: String,
        required: true
    },

    amazonLink: {
        type: String,
        required: true
    }

});


let CombinedPrintEBookFiction = model('CombinedPrintEBookFiction', bookInfoSchema);
let CombinedPrintEBookNonFiction = model('CombinedPrintEBookNonFiction', bookInfoSchema);
let HardcoverFiction = model('HardcoverFiction', bookInfoSchema);
let HardcoverNonFiction = model('HardcoverNonFiction', bookInfoSchema);
let PaperbackTradeFiction = model('PaperBackTradeFiction', bookInfoSchema);
let PaperbackNonFiction = model('PaperBackNonFiction', bookInfoSchema);
let AdviceHowToMiscellaneous = model('AdviceHowToMiscellaneous', bookInfoSchema);

function getCollection(categoryName){

    if(categoryName === 'Combined Print & E-Book Fiction'){
        return CombinedPrintEBookFiction;
    }
    if(categoryName === 'Combined Print & E-Book Nonfiction'){
        return CombinedPrintEBookNonFiction;
    }
    if(categoryName === 'Hardcover Fiction'){
        return HardcoverFiction;
    }
    if(categoryName === 'Hardcover Nonfiction'){
        return HardcoverNonFiction;
    }
    if(categoryName === 'Paperback Trade Fiction'){
        return PaperbackTradeFiction;
    }
    if(categoryName === 'Paperback Nonfiction'){
        return PaperbackNonFiction;
    }
    if(categoryName === 'Advice, How-To & Miscellaneous' ){
        return AdviceHowToMiscellaneous;
    }
}

module.exports = {
    getCollection,
    getDB
};

