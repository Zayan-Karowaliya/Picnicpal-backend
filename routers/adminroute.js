import express from 'express'
import { addplaces,updateplace,getall, deletePlace, getplace, addmyplaces, getmyplace, updatemyplace } from '../controllers/admincontroller.js';
import { upload } from '../controllers/admincontroller.js';

const adminrouter = express.Router();
adminrouter.post("/addplace",upload.single('file'),addplaces)
adminrouter.put("/updateplace/:id",upload.single('file'),updateplace)
adminrouter.route("/deleteplace/:placeId").delete(deletePlace)
adminrouter.route("/getall").get(getall)
adminrouter.route("/singleplace/:eventId").get(getplace)
adminrouter.post("/addmyplace",upload.single('file'),addmyplaces)
adminrouter.get("/getmyplace/:addby",getmyplace)
adminrouter.put("/updatemyplace/:id",upload.single('file'),updatemyplace)
// adminrouter.route("/singleplace/:id").get(getsingle)
// adminrouter.post("/uploadimg",upload.single('file'),getimg)
export default adminrouter