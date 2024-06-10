import mongoose from "mongoose";

const vehicleSchema = mongoose.Schema({
  type: {
    type: String,
    
  },
  numberPlate: {
    type: String,

  },
  numberofseats:{
    type : Number 
    
  },

    drivername: {
      type: String,
 
    },
    driverContact: {
      type: String,
  
    },

  
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
