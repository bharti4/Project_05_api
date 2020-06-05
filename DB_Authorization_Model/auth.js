const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const TOKENSECRET = "kdsdsjaklfjaskl";


module.exports =
{
 getHashedPassword : (password ) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
},

varifyToken: (req,res,next)=>{
    const token=req.cookies.authtoken;
    if(!token) 
    {
        res.status(401);
        res.render('Error',{title:"Error", isError:true, logout:false,bgclass:"background-color:gray",Error:"Access Denied , Please Login to Access " });
        return 0;
    }

    try{
        const varified = jwt.verify(token,TOKENSECRET)
        res.user = varified._id.userid;
     //   console.log( varified._id.userid)
        //req.user = varified;
        next();
    }
    catch(err)
    {
        res.status(400);
        res.render('Error',{title:"Error", isError:true, logout:false,bgclass:"background-color:gray",Error:"Access Denied , Please Login to Access " });
    }

},
setTocken :(res,userid)=>
{
    const token = jwt.sign({_id:userid},TOKENSECRET);
    res.cookie('authtoken',token );
},

isUserLogined : (req)=>
{
    const token=req.cookies.authtoken;
    if(!token) 
    {
        //console.log('false ,no token');
        return false;
    }

    try{
        const varified = jwt.verify(token,TOKENSECRET)
        //console.log('true ,yes token');
        return true
    }
    catch(err)
    {
        return false;
    }
}
}