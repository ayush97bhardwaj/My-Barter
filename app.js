var express=require("express");
var app=express();
var logger=require('morgan');
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var localStratergy=require("passport-local");
var methodOverride=require("method-override");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var User=require("./models/user");
var seedDB=require("./seeds");
var flash=require("connect-flash");
var engines=require('consolidate');
var ejs=require('ejs');
var session = require('client-sessions');
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var GoogleStrategy=require('passport-google-oauth2').Strategy;
var mongoose=require('mongoose');
require('dotenv').config();
var User=require('./models/userModel');

//requiring routes
var commentRoutes=require("./routes/comments")
var campgroundRoutes=require("./routes/campgrounds")
var indexRoutes=require("./routes/index")
var signin=require('./routes/signin')
var signup=require('./routes/signup')
var transaction=require('./routes/transaction.js')

mongoose.Promise = global.Promise;

// var url=process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
var url="mongodb://localhost:27017/hackrupt";
mongoose.connect(url,{useMongoClient: true});


//mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});
//mongoose.connect("mongodb://colt:rusty@ds113358.mlab.com:13358/yelpcamp", {useMongoClient: true});


passport.serializeUser(function(user, done) {
	done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
	done(null, obj);
  });
  
  passport.use(new GoogleStrategy({
	clientID:     process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	//NOTE :
	//Carefull ! and avoid usage of Private IP, otherwise you will get the device_id device_name issue for Private IP during authentication
	//The workaround is to set up thru the google cloud console a fully qualified domain name such as http://mydomain:3000/ 
	//then edit your /etc/hosts local file to point on your private IP. 
	//Also both sign-in button + callbackURL has to be share the same url, otherwise two cookies will be created and lead to lost your session
	//if you use it.
	callbackURL: "http://localhost:3000/auth/google/callback",
	passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
	// asynchronous verification, for effect...
	process.nextTick(function () {
	  
	  // To keep the example simple, the user's Google profile is returned to
	  // represent the logged-in user.  In a typical application, you would want
	  // to associate the Google account with a user record in your database,
	  // and return that user instead.
	  // console.log(profile);
	  // request.session.user=profile;
	  console.log("profile added to session user");
	  return done(null, profile);
	});
  }
  ));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

// app.use(require("express-session")({
//     secret:"Rusty is the cutest of all",
//     resave:false,
//     saveUninitialized:false
// }));
app.use(session({
	cookieName: 'session',
	secret: 'its my first session generation',
	duration: 30*60*1000,
	activeDuration: 30*60*1000,
	httpOnly: true,
	secure: true,
	ephemeral: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
// passport.use(new localStratergy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});
function sesCheck(req,res,next){
	if( (req.session && req.session.user) || req.user)
	  next();
	else
	  res.redirect('/signin');
  }
  
  app.get('/auth/google', passport.authenticate('google', { scope: [
	'email',
	'profile'] 
  }));
  
  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get( '/auth/google/callback', 
   passport.authenticate( 'google', {
	 failureRedirect: '/signin'
  }),function(req,res,next){
	User.findOne({email:req.user.email},function(err,user){
	  if(err) throw err;
	  if(!user){
		console.log(req.user);
		// var usr=req.user.email;
		// usr=usr.substring(0,usr.length-10);
		User.create({
		  "firstname":req.user.name.givenName,
		  "lastname":req.user.name.familyName,
		  "password":"admin123",
		  "email":req.user.email
		},function(err,result){
		  if(err) throw err;
		  else{
			req.logout();
			req.session.user=result;
			res.redirect('/barter');
		  }
		});
	  }      
	  else{
		console.log(req.user);
		req.logout();
		req.session.user=user;
		res.redirect('/barter');
	  }
	});
  });
// app.use("/campgrounds/:id/comments",sesCheck,commentRoutes);
app.use("/barter",sesCheck,campgroundRoutes);
app.use('/signin',signin);
app.use('/signup',signup);
app.use("/",indexRoutes);
app.use('/transaction',transaction);
app.get('/logout',function(req,res,next){
	req.session.reset();
	res.redirect('/signin');
	req.flash('success', 'You have successfully logged out.');
});
app.listen(3000,function(){
	console.log("Server started!");
});