import Vehicle from "../models/vehiclemodel.js";


export const addvehicle =async(req,res)=>{
    try{
        const {type, numberPlate, drivername, driverContact,numberofseats}=req.body

        if (!(type || numberPlate || drivername|| driverContact || numberofseats)) {
            return res.status(400).json({ message: "filed empty" })
          }
          
          const numberexist = await Vehicle.findOne({ driverContact });
          const regNo = await Vehicle.findOne({ numberPlate })
          if (numberexist || regNo) {
            return res.status(400).json({ message: 'car already exist' });
          }

          const newvehicle = await Vehicle.create({ type, numberPlate, drivername,driverContact, numberofseats });
   
          const message = {
            notification: {
              title: 'New Place Added',
              body: `A new Vehicke "${type}" has been added.`,
            },
            token: 'cluhkhzZQdW5jKEjOz9fdn:APA91bHqJ2b4xKbtxSUvMtxBQQj8RIXxmUN0PSXedVxXnVsegCgXeXXsGTQ-Tj8My1vR0rWeN8PnwZpfnbNk3nC3rPeLzTNRKvojjfzUOLP6fWu6Y1K21pUTBMZJquj0gEZmf8XoXj7o', // or use the registration token if you want to send it to specific users
          };
      
          // Send the notification
          SendNotification(message);
          res.status(201).json({ user: newvehicle });
    }
    catch(err){
        res.status(400).json({message: err})
    }
}


export const updateVehicle = async (req, res) => {
    try {
      const { id } = req.params;
      const { type, numberPlate, drivername, driverContact, numberOfSeats } = req.body;
  
      // Check if all fields are provided

  
      // Find the vehicle by ID
      const vehicle = await Vehicle.findById(id);
  
      // Check if the vehicle exists
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      // Check if the numberPlate or driverContact already exists in another vehicle
      const existingVehicleWithSameNumberPlate = await Vehicle.findOne({ numberPlate: numberPlate, _id: { $ne: id } });
      const existingVehicleWithSameDriverContact = await Vehicle.findOne({ driverContact: driverContact, _id: { $ne: id } });
  
      if (existingVehicleWithSameNumberPlate || existingVehicleWithSameDriverContact) {
        return res.status(400).json({ message: 'Number Plate or Driver Contact already exists' });
      }
  
      // Update the vehicle
      vehicle.type = type;
      vehicle.numberPlate = numberPlate;
      vehicle.drivername = drivername;
      vehicle.driverContact = driverContact;
      vehicle.numberOfSeats = numberOfSeats;
  
      // Save the updated vehicle
      await vehicle.save();
  
      res.status(200).json({ message: 'Vehicle updated successfully', vehicle });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

  export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the vehicle by ID
        const vehicle = await Vehicle.findById(id);

        // Check if the vehicle exists
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Delete the vehicle
        await Vehicle.deleteOne({ _id: id }); // Assuming _id is the primary key field

        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
  export const getVehicle = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the vehicle by ID
      const vehicle = await Vehicle.findById(id);
  
      // Check if the vehicle exists
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      res.status(200).json({ vehicle });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // To list all vehicles
  export const getAllVehicles = async (req, res) => {
    try {
      const vehicles = await Vehicle.find({});
      res.status(200).json({ vehicles });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };