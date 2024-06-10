import jwt from 'jsonwebtoken'
const secretKey='your-secret-key';
const validatetoken=(req,res,next)=>{
    
try {
  const {token} = req.body;
    if(token){
     let auth=jwt.verify(token,secretKey)
     req.user=auth;
     next()
    }
    else{
        res.status(401).json({message:"user aunaueeethorized"});
    }
}
catch (error) {
 res.status(401).json({message:"user aunauthorized"});
}
}



export default validatetoken