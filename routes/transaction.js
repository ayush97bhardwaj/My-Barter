var express=require('express');
var router=express.Router();
var bodyParser=require('body-parser');
var mongoose=require('mongoose');
var User=require('../models/userModel');
router.use(bodyParser.json());

router.route('/')
.post(function(req,res,next){
    if(req.body.name=='' || req.body.email=='' || req.body.number=='' || req.body.description=='')
        res.render('campgrounds/new',{msg:'<li class="form-text text-danger">Please Fill in all the details</li>'});
    else{
        if(req.body.method=='money')
            res.redirect('/transaction/money');
        if(req.body.method=='crypto')
            res.redirect('/transaction/crypto');
        if(req.body.method=='commodity')
            res.redirect('/transaction/commodity')
    }
});

router.route('/money')
.get(function(req,res,next){
    res.render('money',{currentuser:req.session.user});
})
.post(function(req,res,next){
    // User.updateOne({email:req.body.email},{
    //     $push:{
    //         requests:{
    //             email:req.session.user.email,
    //             amt:req.body.amt,
    //             modeOfTransfer:req.body.crypto
    //         }
    //     }
    // },function(err,result){
    //     if(err) throw err;
    //     console.log(result);
    // });
});
router.route('/crypto')
.get(function(req,res,next){
    res.render('crypto',{currentuser:req.session.user});
})
.post(function(req,res,next){
    console.log(req.body);
    User.updateOne({email:req.body.email},{
        $push:{
            requests:{
                email:req.session.user.email,
                amt:req.body.amt,
                modeOfTransfer:req.body.crypto
            }
        }
    },function(err,result){
        if(err) throw err;
        console.log(result);
        res.redirect("/barter");
    });
});
router.route('/commodity')
.get(function(req,res,next){
    res.render('commodity',{currentuser:req.session.user});
});

module.exports=router;