var express=require("express")
var router=express.Router()
var Campground=require("../models/campground")
var Comment=require("../models/comment")
var middleware=require("../middleware")
//INDEX
router.get("/",function(req,res){
	Campground.find({},function(err,allCapmground){
		if(err)
		console.log(err);
		else{
		  res.render("campgrounds/index",{campgrounds:allCapmground,currentUser:req.user});	
		}
	});
	
	
});

//CREATE
router.post("/",middleware.isLoggedIn,function(req,res){
	 var name=req.body.name;
	 var image=req.body.image;
	 var price=req.body.price;
	 var desc=req.body.description;
	 var author={
	     id:req.user._id,
	     username:req.user.username
	 }
	 var newCamp={name:name ,price:price,image:image,description:desc,author:author};
	 Campground.create(newCamp,function(err,campground){
	 	if(err){
	 		console.log(err);
	 	}
	 	else{
	 		res.redirect("/campgrounds");
	 	}
	 });
	 
});

//NEW
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//SHOW
router.get("/:id",function(req, res) {
    //res.send("This will be an info page one day!"); 
	Campground.findById(req.params.id).populate("comments").exec(function(err,found){
		if(err)
		console.log(err);
		else
		res.render("campgrounds/show",{campground:found});
	});
});

//EDIT
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req, res) {
   	Campground.findById(req.params.id,function(err,foundCampground){
   	res.render("campgrounds/edit",{campground:foundCampground});
 });
});

//UPDATE
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//DESTROY
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err)
		{
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds");
		}
	})
})

module.exports=router; 