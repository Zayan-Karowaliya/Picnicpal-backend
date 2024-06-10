
import admin from "../models/admincrudmodel.js";
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import * as fs from 'fs';
// import * as path from 'path'
import SendNotification from "../sendNotification.js";
 


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const upload = multer({ storage: storage });

export const addplaces=async(req,res)=>{
    try {
         
        const { EventType, NameOfPlace,Brief, Description,NumberOfPeople,location,latitude,longitutde } = req.body;

        if (!(NameOfPlace || Description || Brief || EventType || location)) {
          return res.status(400).json({ message: "field empty" });
        }
    const file = req.file; // Assuming you're using multer for file upload

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
        const newUser = new admin({NameOfPlace,Description,Brief,NumberOfPeople,EventType,location,latitude,longitutde,image: file.filename,});
        await newUser.save();
       
        const message = {
          notification: {
            title: 'New Place Added',
            body: `A new place "${NameOfPlace}" has been added.`,
          },
          token: 'cluhkhzZQdW5jKEjOz9fdn:APA91bHqJ2b4xKbtxSUvMtxBQQj8RIXxmUN0PSXedVxXnVsegCgXeXXsGTQ-Tj8My1vR0rWeN8PnwZpfnbNk3nC3rPeLzTNRKvojjfzUOLP6fWu6Y1K21pUTBMZJquj0gEZmf8XoXj7o', // or use the registration token if you want to send it to specific users
        };
    
        // Send the notification
        SendNotification(message);
        res.status(200).json({ message: 'Places Added successfully' });
      } catch (error) {
        res.status(500).json({ message: 'An error occurred'});

      }
    }

    export const updateplace = async (req, res) => {
      try {
        const { id } = req.params;
        const { EventType, NameOfPlace, Brief, Description, NumberOfPeople, location,latitude,longitutde } = req.body;
    
        if (!(NameOfPlace || Description || Brief || EventType || location)) {
          return res.status(400).json({ message: "Fields are empty" });
        }
    
        const existingPlace = await admin.findById(id);
    
        if (!existingPlace) {
          return res.status(404).json({ message: 'Place not found' });
        }
    
        const file = req.file; // Assuming you're using multer for file upload
    
        if (file) {
          // Update the image if a new file is provided
          existingPlace.image = file.filename;
        }
    
        // Update other fields
        existingPlace.NameOfPlace = NameOfPlace;
        existingPlace.Description = Description;
        existingPlace.Brief = Brief;
        existingPlace.EventType = EventType;
        existingPlace.location = location;
        existingPlace.NumberOfPeople = NumberOfPeople;
        existingPlace.latitude=latitude;
        existingPlace.longitutde=longitutde;
    
        await existingPlace.save();
    
        res.status(200).json({ message: 'Place updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
      }
    };

    
    export const deletePlace = async (req, res) => {
      try {
        const { placeId } = req.params;
    
        // Check if placeId is provided
        if (!placeId) {
          return res.status(400).json({ message: "Place ID not provided" });
        }
    
        // Use Mongoose to find and remove the place by ID
        const deletedPlace = await admin.findByIdAndRemove(placeId);
    
        if (!deletedPlace) {
          return res.status(404).json({ message: "Place not found" });
        }
    
        res.status(200).json({ message: "Place deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
      }
    };
    
    
    export const getall=async(req,res)=>{
      try {
        const data=await admin.find({});
        res.json(data)
      
    } catch (error) {
      res.status(500).json({message:error.message})
    }


    }
    export const getplace=async(req,res)=>{
      try {
        const { eventId } = req.params;
    
        // Use Mongoose to find the event by its ID
        const event = await admin.findById(eventId);
    
        // Check if the event exists
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
      

        // Send the image URL as the response
        res.json({event});
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
      }
    };

    export const addmyplaces=async(req,res)=>{
      try {
           
          const { EventType, NameOfPlace,Brief, Description,NumberOfPeople,location,addby,date,from,to,latitude,longitutde } = req.body;
  
          if (!(NameOfPlace || Description || Brief || EventType || location)) {
            return res.status(400).json({ message: "field empty" });
          }
      const file = req.file; // Assuming you're using multer for file upload
  
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
          const newUser = new admin({NameOfPlace,Description,Brief,NumberOfPeople,EventType,location,addby,date,from,to,latitude,longitutde,image: file.filename,});
          await newUser.save();
          const message = {
            notification: {
              title: 'New Place Added',
              body: `A new place "${NameOfPlace}" has been added.`,
            },
            token: 'cluhkhzZQdW5jKEjOz9fdn:APA91bHqJ2b4xKbtxSUvMtxBQQj8RIXxmUN0PSXedVxXnVsegCgXeXXsGTQ-Tj8My1vR0rWeN8PnwZpfnbNk3nC3rPeLzTNRKvojjfzUOLP6fWu6Y1K21pUTBMZJquj0gEZmf8XoXj7o', // or use the registration token if you want to send it to specific users
          };
      
          // Send the notification
          SendNotification(message);
          res.status(200).json({ message: 'Places Added successfully' });
        } catch (error) {
          res.status(500).json({ message: 'An error occurred'});
  
        }
      }

      export const updatemyplace = async (req, res) => {
        try {
          const { id } = req.params;
          const { EventType, NameOfPlace, Brief, Description, NumberOfPeople, location,addby,date,from,to,latitude,longitutde } = req.body;
      
          if (!(NameOfPlace || Description || Brief || EventType || location)) {
            return res.status(400).json({ message: "Fields are empty" });
          }
      
          const existingPlace = await admin.findById(id);
      
          if (!existingPlace) {
            return res.status(404).json({ message: 'Place not found' });
          }
      
          const file = req.file; // Assuming you're using multer for file upload
      
          if (file) {
            // Update the image if a new file is provided
            existingPlace.image = file.filename;
          }
      
          // Update other fields
          existingPlace.NameOfPlace = NameOfPlace;
          existingPlace.Description = Description;
          existingPlace.Brief = Brief;
          existingPlace.EventType = EventType;
          existingPlace.location = location;
          existingPlace.NumberOfPeople = NumberOfPeople;
          existingPlace.addby = addby;
          existingPlace.date = date;
          existingPlace.from = from;
          existingPlace.to = to;
          existingPlace.latitude = latitude;
          existingPlace.longitutde = longitutde;

          await existingPlace.save();
      
          res.status(200).json({ message: 'Place updated successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'An error occurred' });
        }
      };
  

// export const getsingle=async(req,res)=>{
//    try {
//     const {id}=req.params
//     const data = await admin.findById(id);
//     res.json(data);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
//    }

//     export const singleFileUpload = async (req, res) => {
     
//       console.log('File received:', req.file);
//   res.send('File uploaded successfully');
//   }


export const getmyplace=async(req,res)=>{
  try {
    const { addby } = req.params;
    // Use Mongoose to find the event by its ID
    const event = await admin.find({addby:addby});

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
  

    // Send the image URL as the response
    res.json({event});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};