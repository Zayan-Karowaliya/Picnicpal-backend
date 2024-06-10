
import express from 'express'
import { loginuser, registeruser,checkuser,getSavedPlaces,joinevent,userprofile,
 singleuser, userlogin, adminlogin,createchecklist, updatechecklist,
 deletechecklist, 
 getchecklist,
 updatestatus,
 time,
 LeaveEvent,sharedthought, getshredthought, reaction, getalluser,updateuser, updatePassword,getNearby,
 savevehicle,
 getSavedVehicles,deleteSavedVehicle,
 apifetch,
 getweather} from '../controllers/userlogincontroller.js';
import validatetoken from '../middleware/authenticate.js';
const loginrouter = express.Router();
// loginrouter.use("authenticateUser");
loginrouter.post("/nearby",getNearby)
loginrouter.post("/sharedthought/:event_id", validatetoken, sharedthought);
loginrouter.post("/getsharedthought/:event_id", validatetoken, getshredthought);
loginrouter.post("/reaction/:event_id", validatetoken, reaction);
loginrouter.post("/getalluser", validatetoken, getalluser);
loginrouter.route("/register").post(registeruser)
loginrouter.post("/updateuser",validatetoken,updateuser)
loginrouter.post("/updatepass",validatetoken,updatePassword)
loginrouter.route("/checkuser").post(checkuser)
loginrouter.route("/login").post(loginuser)
loginrouter.post("/user",validatetoken,userlogin)
loginrouter.post("/admin",validatetoken,adminlogin)
loginrouter.post("/userprofile",validatetoken,userprofile)
loginrouter.post("/joinEvent/:placeId",validatetoken,joinevent)
loginrouter.delete("/leaveevent/:placeId",validatetoken,LeaveEvent)
loginrouter.post("/getsaveevent",validatetoken,getSavedPlaces)
loginrouter.post("/singleuser",validatetoken,singleuser)
loginrouter.post("/createchk",validatetoken,createchecklist)
loginrouter.put("/updatechk/:itemId",validatetoken,updatechecklist)
loginrouter.delete("/deletechk/:itemId",validatetoken,deletechecklist)
loginrouter.post("/getchk",validatetoken,getchecklist)
loginrouter.post("/updatests",validatetoken,updatestatus)
loginrouter.post("/time/:eventId",validatetoken,time)
loginrouter.post("/savevehicle/:vehicleid",validatetoken,savevehicle)
loginrouter.post("/getmyvehicle",validatetoken,getSavedVehicles)
loginrouter.post("/fetchapi",apifetch)
loginrouter.delete("/deletevehicle/:vehicleid",validatetoken,deleteSavedVehicle)
loginrouter.get("/getweather",getweather)
// loginrouter.post("/usergoingtime",validatetoken,notify)

// loginrouter.route("/userprofile",authenticateUser).post(userprofile) 
// loginrouter.route("/sendotp").post(sendOTP)
export default loginrouter
