var mysql = require("mysql")
var auth= require('./auth.js');
const dbconfig=require("../DB_Authorization_Model/config.js");

const db = mysql.createConnection(dbconfig.databseTableconnection);
db.connect(async function (err) {
  if (err) {
    console.log("App could not connect to the DB. Stoppin");
    throw "App could not connect to the DB. Stopping...";
  }
  else
  {
      console.log("Database connected");
  }
})

usermodel =
{
RegisterUser: function(req,callback){

    const { surname, firstname, email, password, confirmpassword } = req.body;
    if (password === confirmpassword)
     {
      // Check if user with the same email is also registered
        db.query("select * from Users where email = ?",[email],(error,rows)=>{
        if(error)
        {
            callback(error,'Database Error')
        }
        else if(rows.length)
        {
            callback(true,'User with same E-mail is already register.')
        }
        else
         { 
          const hashedPassword = auth.getHashedPassword(password);
          // const hashedPassword = bcrypt.hash(req.body.password,10);
          req.body.password = hashedPassword;
        
          this.addUser(req,(err)=> {
          if(err)
             callback(err,'Database Error')
           else
             callback(null,'Registration Complete. Please login to continue.')
               // Store user into the database if you are using one
        })
      }
    })
    }   
    else 
    {
         callback(true,'Password does not match.')
     }
},
addUser:(req,callback)=>{
    
    var post = { firstname: req.body.firstname, surname: req.body.surname , email: req.body.email,userpassword: req.body.password}
    
    var sql = "insert into users SET ?"
    db. query(sql,post,(err,result)=>{
        if(err)  callback(err); 
        else  callback(null);
    })
    
},

varifyuser: (req,callback)=>{
    sql="select userid from Users where email = ? and userpassword = ?"
    hashedPassword=auth.getHashedPassword(req.body.password)

    db.query(sql,[req.body.email, hashedPassword],(err,result)=>
    {
    if(err)
        callback(err,"Database Error",null);
    else
    {
        if(result.length>0)
            callback(null,null,result[0])
        else
            callback(true,"Invalid Credential",null)
    }
    })
},

communityScore: function(movieId,cb)
{ 
    con=mysql.createConnection(dbconfig.databseTableconnection);
    con.connect(function(err) 
    {
    if (err)    cb(err,null) 
      
      //var sql = "SELECT rating FROM userRating  movieId = ?";
      var sql = "select sum(rating)/count(*) as communityscore from MovieSchema.userRating where movieId = ?;"
      con.query(sql,[movieId], function (err, result) {
      if(err) /* database / system related error */
            cb(err,null) ;
      else if(result[0].communityscore!=null)        /*rating found in database*/
      {    
           cb(null,result[0].communityscore)
      }
      else {
          cb(null,0)                    /*No ratings in database */
      }
    });
    
    })
},

addMovieRating: (movieId,userId,rating,callback) => {
 
    var sql = "select * from userRating where userId=? and movieId=?"
    db.query (sql,[userId,movieId],(error,result)=>
    {
       // console.log(result[0].rating);
   if(error)
        callback(error,null);
    else if(result.length > 0)
         callback(null,"Movie is already rated with rating :"+ result[0].rating)
    else            
    {
        var sql = "insert into userRating (userId, movieId ,rating) VALUES (?,?,?)"
        db.query(sql,[userId, movieId ,rating],(err,result)=>
        { 
            if(err)
                callback(err,null);
            else
            {  callback(null,"Rating successfuly saved.");
            }
        }) //end of inner sql

    }
    }) // end of outer sql 
}

}
module.exports = usermodel