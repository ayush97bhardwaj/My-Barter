var mongoose=require('mongoose');
var uniqueValidator=require('mongoose-unique-validator')
require('mongoose-type-email');
var schema=mongoose.Schema;
// var passportLocalMongoose = require('passport-local-mongoose');

var moneySchema=new schema({
    name:{
        type:String,
    },
    balance:{
        type:Number,
    }
}); 
var requestSchema=new schema({
    email:{
        type:String,
    },
    amt:{
        type:Number,
    },
    accepted:{
        type:Boolean,
        default:false,
    },
    modeOfAcceptance:{
        type:String,
    },
    modeOfTransfer:{
        type:String
    }
});
var userSchema=new schema({
    firstname : {
        type : String,
		required : true
    },
    lastname : {
        type: String,
		required : true
    },
    email : {
        type : mongoose.SchemaTypes.Email,
        required : true,
        unique : true
    },
    password : {
        type : String,
        minlength : 8,
    },
    phone:{
        type:String,
    },
    money:[moneySchema],
    crypto:[moneySchema],
    commodity:[moneySchema],
    requests:[requestSchema],
    dob : { type : String },
},{
    timestamps: true
});
userSchema.plugin(uniqueValidator);
var user = mongoose.model('users',userSchema);

module.exports = user;