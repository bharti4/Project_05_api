var express = require('express');
var router = express.Router();
var mysql = require("mysql");
usermodels = require('../DB_Authorization_Model/usermodel.js');
const {varifyToken,setTocken,isUserLogined} = require("../DB_Authorization_Model/auth.js");
var datalize = require("datalize");
const field = datalize.field;
const fetch = require('node-fetch');
var fs = require("fs");
var path = require('path');

/* Get home page*/
router.get('/',(req , res) =>
{   
    //res.render('MovieList',{title:"Movies", isError:true, bgclass:"background-color:gray",logout:true,Error:"Database Error:Not able to Query Database" });
    if(isUserLogined(req)) 
        res.render('MovieList',{title:"Movies", logout:true});
     else
        res.render('MovieList',{title:"Movies", isError:false,logout:false});
   
}) 

// returns community score for movie
router.get('/moviescore/:movieId',(req , res) =>
{
   movieId=req.params.movieId;
   usermodels.communityScore(movieId,(err,result)=>{
    if(err)
    {
      // res.send('Error in Retriving'); 
      console.log("Error in Retriving")
    }
    else if(result==0)
    {
      res.send('Not Rated');
    }
    else
    {
      res.send(result.toString());
    }

   })
})

//saves the movie score for movie
router.post('/moviescore',varifyToken,(req , res) =>
{
    movieId=req.body.movieId;
    userId=res.user;
    rating=req.body.rating;
    userId = res.user;
   usermodels.addMovieRating(movieId,userId,rating,(err,result)=>{
    if(err)
    {
      res.status(500)
      res.send('Error in saving');
      console.log(err);
    }
    else if(result==null)
    {
      res.send('Not Rated');
    }
    else
    {
      res.status(201);
      res.send(result.toString());
    }

   })

})

router.get('/movieDetail/:movieId',async (req , res) =>
{
    movieId= req.params.movieId;
    console.log(movieId)
    var movieDetailData={};
    try{
    const response = await fetch('https://yts.mx/api/v2/movie_details.jsonp?movie_id='+movieId);
    
    if(response.ok)
    {
      const json = await response.json();
      
       movieDetailData = {
        "poster":json.data.movie.large_cover_image ,
        "title":json.data.movie.title_long ,
        "year":json.data.movie.year ,
        "synopsis":json.data.movie.synopsis,
        "movieId":movieId
      }
    }
    else
    {
      console.log("API retrive errror")
    }
  }catch(error)
  {
    console.log("catch"+error);
    movieDetailData = {
      poster:"API Retrieve Error" ,
      title:"API Retrieve Error" ,
      year:"year" ,
      synopsis:"synopsis",
      movieId:movieId
    }
  }
 
if(isUserLogined(req)) 
  res.render('MovieDetail',{title:movieDetailData.title, isError:false,logout:false,MovieDetailData:movieDetailData,logout:true});
else
  res.render('MovieDetail',{title:movieDetailData.title, isError:false,logout:false,MovieDetailData:movieDetailData,logout:false});

})


//register for sign up form display for new users
router.get('/register', function(req, res) {
  res.render('register',{title:"User Sign Up", isError:false,logout:false});
});



// validation fiels for registration route defined next to this
const registerFieldValidation = 
datalize([
	field('email', 'E-mail').required().email(),
	field('surname', 'SurName').required(),
	field('firstname', 'First Name').required().trim(),
  field('password', 'Password').required().custom(async (value) => {
    const regexp = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})");
    if (!regexp.test(String(value))) {
        throw new Error('%s must be 6 to 20 characters string with at least one digit, one upper case letter, one lower case letter and one special symbol (“@#$%”)');
      } }),
  field('confirmpassword','Confirm Password').required().custom(async (value, result) => {
    if (await result.getValue('password') !== value) {
      throw new Error('Confirm Password must be same as Password.');
    }
  })
]);

// /register  for sign up new users
router.post('/register',registerFieldValidation,(req, res,next)=> {
    
    if(!req.form.isValid)
    {
      res.status('400');
      res.render('register', {
        title: "User sign Up",
        message: req.form.errors,
        messageClass: 'alert'
        });
   }
    else
    {
        
     usermodels.RegisterUser(req,(error,msg)=>{
       
      if(error)
      {
        res.status(501)
        res.render('register', {
          title: "User sign Up",
          message:{"msg":msg},
          messageClass: 'alert'
          });
      }
      else{
        //req.flash('suceess',"User Registration Successfull.")
        res.status(201);
        res.render('login', {
          title: "User Login",
          message:{"msg":"User Registration Successfull."},
          messageClass: 'success'
          });
        }  
      
    })
  }
});

// login form display
router.get('/login',(req,res)=>{
  res.render('login',{title:"User Login "});
});

//validation for login form
const loginFieldsValidation = datalize([field('email', 'E-mail').required().email(),
                                      field('password', 'Password').required().custom(async (value) => {
                                    const regexp = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})");
                                    if (!regexp.test(String(value))) {
                                        throw new Error('%s must be 6 to 20 characters string with at least one digit, one upper case letter, one lower case letter and one special symbol (“@#$%”)');
                            } })
                            ]);
// login post
router.post('/login',loginFieldsValidation , (req,res)=>
{
 
  if(!req.form.isValid)
 {
   res.status(400)
   res.render('login', {
    title:"User Login",
    logout:false,
     message: req.form.errors,
     messageClass: 'alert'
     });
  }
  else{
  usermodels.varifyuser(req,(err,msg,userid)=>{ 
    if(err)
    {
      res.status(401);
      msg = {'msg':'Invalid Credential , Please Try Agian.'};
      res.render('login',{title:"User Login",logout:false, message:msg,messageClass:"alert"});
      //msg="Invalid Credential , Please Try Agian." 
    }
    else{
      setTocken(res,userid)
     
     res.redirect("/");
   }
   
  }) // end of varifyuser
  }
});

router.get('/logout',(req,res)=>{
   res.clearCookie('authtoken');
   res.redirect('/');
});

module.exports = router;
