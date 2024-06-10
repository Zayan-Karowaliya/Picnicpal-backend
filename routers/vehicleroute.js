import express from 'express'
import { addvehicle, deleteVehicle, getAllVehicles, getVehicle, updateVehicle } from '../controllers/vehiclecontroller.js';


const vehiclerouter = express.Router();

vehiclerouter.post("/addvehicle",addvehicle)
vehiclerouter.put("/updatevehicle/:id",updateVehicle)
vehiclerouter.delete("/deleteadminvehicle/:id",deleteVehicle)
vehiclerouter.get("/getallvehicle",getAllVehicles)
vehiclerouter.get("/singlevehicle/:id",getVehicle)
export default vehiclerouter;