
import Userlogin from "../models/userlogin-signupmodel.js";
import admin from "../models/admincrudmodel.js";
import bcrypt from 'bcrypt';
import emailValidator from 'email-validator';
import jwt from 'jsonwebtoken'
import axios from 'axios'
import geolib from 'geolib'
import Vehicle from "../models/vehiclemodel.js";
const secretKey = 'your-secret-key';
import SendNotification from "../sendNotification.js";
export const registerAdmin = async () => {
  const adminUsername = 'admin';
  const adminPassword = 'adminpassword'; 
  const adminemail='admin@gmail.com'// Change to a secure password
  const adminRole = 'admin';

  try {
    const existingAdmin = await Userlogin.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Userlogin.create({ username: adminUsername, password: hashedPassword,email:adminemail, role: adminRole });
      console.log('Admin user registered successfully.');
    } else {
      console.log('Admin user already registered.');
    }
  } catch (error) {
    console.error('Error registering admin user:', error);
  }
};

// Invoke registerAdmin on startup



//checkuser
export const checkuser = async (req, res) => {
  try {
    const existingUser = await Userlogin.findOne({ username: req.body.username });
    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//registeruser
export const registeruser = async (req, res) => {
  try {

    const { username, email, password } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: "field empty" })
    }

    if (!emailValidator.validate(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }



    const emailExist = await Userlogin.findOne({ email });
    const usernameexist = await Userlogin.findOne({ username })
    if (emailExist || usernameexist) {
      return res.status(400).json({ message: 'Email or username is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);


    // const otpSecret = speakeasy.generateSecret().base32;
    const newUser = await Userlogin.create({ username, email, password: hashedPassword, role: 'user' });
   

    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });

  }


  

}
export const updateuser = async (req, res) => {
  try {
    const { email, age, gender,data } = req.body;
    const userId = req.user.id; // Assuming you have middleware to extract user ID from the token

    // Validate the request body
    if (!emailValidator.validate(email) || !isAllowedDomain(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if the new email is already used by another user
    const existingUserWithNewEmail = await Userlogin.findOne({ email, _id: { $ne: userId } });

    if (existingUserWithNewEmail) {
      return res.status(400).json({ message: 'Email is already registered by another user' });
    }

    // Update the user profile in the database
    const updatedUser = await Userlogin.findByIdAndUpdate(
      userId,
      { email, age, gender,data },
      { new: true } // This option returns the modified document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }

  function isAllowedDomain(email) {
    // Define an array of allowed email domains
    const allowedDomains = ["gmail.com", "yahoo.com", "hotmail.com"];

    // Extract the domain from the email address
    const [, domain] = email.split("@");

    // Check if the extracted domain is in the allowed domains array
    return allowedDomains.includes(domain);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
    const userId = req.user.id;
    // Find the user by ID
    const user = await Userlogin.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Compare the old password
    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password before updating it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

//loginuser
export const loginuser = async (req, res) => {

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "filed empty" })
    }
    const user = await Userlogin.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    const token = jwt.sign({ id: user._id,role: user.role }, 'your-secret-key', { expiresIn: '1h' });
    res.json({ id: user._id, token, role: user.role});

  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

}
export const userlogin=async(req,res)=>{
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ message: 'User route', user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } 
}
export const adminlogin=async(req,res)=>{
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ message: 'Admin route', user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getalluser=async(req,res)=>{
  try {
    const{id}=req.user;
    const user = await Userlogin.findById(id);
  if(!user){
    return res.status(404).json({ error: 'user not found' });
  }
    
   res.json(user)
  
} catch (error) {
  res.status(500).json({message:error.message})
}
}

export const getSavedPlaces = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await Userlogin.findById(id).populate({
      path: 'savedPlaces.place',
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize an object to store all available fields
    const allFields = {};

    // Extract all available fields from saved events
    user.savedPlaces.forEach(savedPlace => {
      if (savedPlace.place) {
        const placeFields = Object.keys(savedPlace.place.toObject());
        placeFields.forEach(field => {
          allFields[field] = true; // Mark the field as available
        });
      }
    });

    // Extract the relevant information for each saved event
    const savedEvents = user.savedPlaces.map(savedPlace => {
      if (savedPlace.place) {
        const eventInfo = {};
        Object.keys(allFields).forEach(field => {
          eventInfo[field] = savedPlace.place[field];
        });
        // Also include goingTime and leavingTime
        eventInfo['GoingTime'] = savedPlace.goingTime;
        eventInfo['LeavingTime'] = savedPlace.leavingTime;
        return eventInfo;
      } else {
        return null; // Or handle the case where savedPlace.place is null
      }
    }).filter(Boolean); // Filter out null values from the array

    res.status(200).json({ success: true, savedEvents });
  } catch (error) {
    console.error('Error getting saved events:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getNearby = async (req, res) => {
  try {
    // Hardcoded latitude and longitude coordinates
    const { latitude, longitude } = req.body;
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
    const currentLocation = { latitude, longitude };

    // Google Places API endpoint for nearby search
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=restaurant&key=AIzaSyDRsSVJu_Z3geRw5aatpB_pOdj4qQ5Bk9w`;

    // Make a GET request to the Google Places API
    const response = await axios.get(apiUrl);

    if (response.data.status === 'OK') {
      // Extract the list of nearby restaurants from the response
      const nearbyRestaurants = response.data.results;

      // Iterate through each restaurant to fetch details including images
      const restaurantsWithDetails = await Promise.all(
        nearbyRestaurants.map(async restaurant => {
          const restaurantLocation = {
            latitude: restaurant.geometry.location.lat,
            longitude: restaurant.geometry.location.lng,
          };
          const distance = geolib.getDistance(currentLocation, restaurantLocation);
          
          // Get detailed information about the restaurant including images
          const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&fields=name,photos,reviews&key=AIzaSyDRsSVJu_Z3geRw5aatpB_pOdj4qQ5Bk9w`;
          const placeDetailsResponse = await axios.get(placeDetailsUrl);
          const restaurantDetails = placeDetailsResponse.data.result;
          const photos = restaurantDetails.photos || [];
          const imageUrls = photos.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=AIzaSyDRsSVJu_Z3geRw5aatpB_pOdj4qQ5Bk9w`);
          const reviews = restaurantDetails.reviews || [];
          
          // Add distance, image URLs, and reviews to the restaurant object
          return { ...restaurant, distance, imageUrls, reviews };
        })
      );

      // Send the list of nearby restaurants with distances, image URLs, and reviews as the response
      res.json({ success: true, nearbyRestaurants: restaurantsWithDetails });
    } else {
      console.error('Failed to retrieve nearby restaurants:', response.data.status);
      res.status(500).json({ success: false, error: 'Failed to retrieve nearby restaurants' });
    }
  } catch (error) {
    console.error('Error searching for nearby restaurants:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


export const apifetch = async (req, res) => {
  const { latitude, longitude } = req.body;
  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);
  try {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=restaurant&key=AIzaSyDRsSVJu_Z3geRw5aatpB_pOdj4qQ5Bk9w`;
      
      // Make a GET request to the Google Places API
      const response = await axios.get(apiUrl);

      // Return the results from the response
      res.json(response.data.results);
  } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

export const LeaveEvent=async(req,res)=>{
  try {
    const { placeId } = req.params;
    const { id } = req.user;

    // Check if the place exists
    const place = await admin.findById(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const user = await Userlogin.findById(id);

    // Check if the user has joined this place
    const savedPlaceIndex = user.savedPlaces.findIndex(savedPlace => savedPlace.place.equals(placeId));
    if (savedPlaceIndex === -1) {
      return res.status(400).json({ error: 'User has not joined this place' });
    }

    // Decrement NumberOfPeople in the place
    await admin.findByIdAndUpdate(placeId, { $inc: { NumberOfPeople: -1 } }, { new: true });

    // Remove the saved place from the user's list
    user.savedPlaces.splice(savedPlaceIndex, 1);

    await user.save();

    // Populate the savedPlaces with place details
    const finaluser = await Userlogin.findById(id).populate({
      path: 'savedPlaces.place',
      select: 'NameOfPlace Description', // Specify the fields you want to populate
    });

    res.json(finaluser);
  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
// const scheduleNotifications = (user) => {
//   const jobGoing = schedule.scheduleJob(new Date(user.goingTime)- 5 * 60 * 1000, () => {
//     console.log(`Send notification for going to event: ${user.username}`);
//     // Implement your notification logic here
//   });


// };
export const joinevent = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { id } = req.user;

    // Check if the place exists
    const place = await admin.findById(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const user = await Userlogin.findById(id);

    // Check if the user has already joined this place
    if (user.savedPlaces.some(savedPlace => savedPlace.place.equals(placeId))) {
      return res.status(400).json({ error: 'User has already joined this place' });
    }

    // Update the user's savedPlaces and increment NumberOfPeople in the place
    console.log('Joining Event for Place ID:', placeId);

    // Modify the savedPlaces structure
    user.savedPlaces.push({
      place: placeId,
      goingTime: null, // You can set the default values as needed
      leavingTime: null,
    });

    await Promise.all([
      user.save(),
      admin.findByIdAndUpdate(placeId, { $inc: { NumberOfPeople: 1 } }, { new: true }),
    ]);

    // Populate the savedPlaces with place details
    const finaluser = await Userlogin.findById(id).populate({
      path: 'savedPlaces.place',
      select: 'NameOfPlace Description loaction', // Specify the fields you want to populate
    });

    res.json(finaluser);
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const userprofile = async (req, res) => {
  console.log(req.user);

  try {
    const { id } = req.user;
    const {username,email, age, gender, data,password } = req.body
    console.log(id)
    // const myuser = await Userlogin.findOne({ userId });

    //   res.send(myuser);
    const updateduser = await Userlogin.findByIdAndUpdate(
      id,
      {username, email, age, gender, data,password},
      { new: true } // This option returns the updated document
    );
    if (!updateduser) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ message: ' updated successfully', updateduser });
  }





  catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const sharedthought = async (req, res) => {
  try {
    const { id } = req.user;
    const { event_id } = req.params;
    const { fact } = req.body;

    const user = await Userlogin.findById(id);
    const event = await admin.findById(event_id);

    if (!user || !event) {
      return res.status(404).json({ error: 'User or event not found' });
    }

    // Check if the user has already shared a thought for this event
    const existingSharedThought = user.sharedFacts.find(
      (thought) => thought.event && thought.event.toString() === event_id
    );

    if (existingSharedThought) {
      // If the user has already shared a thought, prevent adding the same thought again
      return res.status(400).json({ error: 'You have already shared a thought for this event' });
    }

    // Add a new shared thought for the user
    user.sharedFacts.push({ event: event_id, fact });
    await user.save();

    // Check if the user has already shared a thought for this event in the event's data
    const existingEventThoughtIndex = event.sharedFacts.findIndex(
      (thought) => thought.user && thought.user.toString() === id
    );

    if (existingEventThoughtIndex !== -1) {
      // Update the existing shared thought in the event
      event.sharedFacts[existingEventThoughtIndex].fact = fact;
    } else {
      // Add a new shared thought to the event
      event.sharedFacts.push({ user: id, fact });
    }

    await event.save();

    return res.json({ message: 'Fact shared successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};




export const getshredthought = async (req, res) => {
  try {
    const { id } = req.user;
    const { event_id } = req.params;

    // Find the event by ID
    const event = await admin.findById(event_id);

    const user = await Userlogin.findById(id);
   

    if ( !event) {
      return res.status(404).json({ error: ' event not found' });
    }

    // Check if the event exists
    const sharedThoughts = event.sharedFacts.map(async (sharedFact) => {
      const sharedUser = await Userlogin.findById(sharedFact.user);
      return {
        username: sharedUser ? sharedUser.username : 'Unknown User',
        fact: sharedFact.fact,
      };
    });

    // Add shared fact to event
    const sharedThoughtsData = await Promise.all(sharedThoughts);

    return res.json({ sharedThoughts: sharedThoughtsData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const reaction=async(req,res)=>{
  try {
    const { id } = req.user;
    const { event_id } = req.params;
    const { emoji } = req.body;

    const user = await Userlogin.findById(id);
    const event = await admin.findById(event_id);

    if (!user || !event) {
      return res.status(404).json({ error: 'User or event not found' });
    }

    // Add the reaction to the event
    event.sharedFacts.push({ user: id, reaction: emoji });
    await event.save();

    return res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
export const singleuser = async (req, res) => {
  const { id } = req.user;

  // Find the user by userId and retrieve the savedPlaces array
  const user = await Userlogin.findById(id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Specify the destination folder
//   },
//   filename: function (req, file, cb) {
//     // Use the original file name with a timestamp to avoid overwriting
//     cb(null, `${Date.now()}_${file.originalname}`);
//   },
// });

// export const upload = multer({ storage: storage });



// export const getimg=async(req,res)=>{
//   try {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     // Process the file as needed
//     // For example, you can save the file information to a database
//   console.log(file,"test")
//     res.status(200).json({
//       message: 'File uploaded successfully',
//       filename: file.filename,
//     });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }

// }


export const createchecklist=async(req,res)=>{
  try {
    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Get item details from the request body
    const { name, description } = req.body;
    if (!name|| !description) {
      return res.status(400).json({ message: "field empty" })
    }

    // Create a new checklist item
    const newItem = {
      name,
      description,
    };

    // Find the user by ID and push the new item to the equipmentChecklist array
    const updatedUser = await Userlogin.findByIdAndUpdate(
      userId,
      { $push: { equipmentChecklist: newItem } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Item added to checklist successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
};


export const updatechecklist=async(req,res)=>{
  try {
    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Get item ID from the request parameters
    const itemId = req.params.itemId;

    // Get updated item details from the request body
    const { name, description } = req.body;

    // Find the user by ID
    const user = await Userlogin.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the checklist item by ID
    const checklistItem = user.equipmentChecklist.find((item) => item._id.toString() === itemId);

    if (!checklistItem) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }

    // Update the item details
    checklistItem.name = name || checklistItem.name;
    checklistItem.description = description || checklistItem.description;

    // Save the changes to the user document
    await user.save();

    res.json({ message: 'Item updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const deletechecklist=async(req,res)=>{
  try {
    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Get item ID from the request parameters
    const itemId = req.params.itemId;

    // Find the user by ID
    const user = await Userlogin.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the checklist item by ID
    const checklistItemIndex = user.equipmentChecklist.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (checklistItemIndex === -1) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }

    // Remove the checklist item from the array
    user.equipmentChecklist.splice(checklistItemIndex, 1);

    // Save the changes to the user document
    await user.save();

    res.json({ message: 'Item deleted successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }

}


export const getchecklist = async (req, res) => {
  try {
    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Find the user by ID
    const user = await Userlogin.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve the equipment checklist from the user document
    const checklist = user.equipmentChecklist;

    // Check for "not done" items and send notifications
    checklist.forEach(item => {
      if (item.status === 'not done') {
        const message = {
          notification: {
            title: 'Item Pending',
            body: `The item "${item.name}" is pending in your checklist.`,
          },
          token: 'cluhkhzZQdW5jKEjOz9fdn:APA91bHqJ2b4xKbtxSUvMtxBQQj8RIXxmUN0PSXedVxXnVsegCgXeXXsGTQ-Tj8My1vR0rWeN8PnwZpfnbNk3nC3rPeLzTNRKvojjfzUOLP6fWu6Y1K21pUTBMZJquj0gEZmf8XoXj7o',
        };

        // Send the notification with a delay of 1 second
        setTimeout(() => {
          SendNotification(message);
        }, 15000);
      }
    });

    res.json({ checklist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatestatus=async(req,res)=>{
  const userId = req.user.id;
  const {status,itemId} = req.body;
try {
  const user = await Userlogin.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updatedItem = user.equipmentChecklist.id(itemId);

  if (updatedItem) {
    // Update the status
    updatedItem.status = status;

    // Save the changes
    await user.save();

    return res.status(200).json({ message: 'Status updated successfully' });
  } else {
    return res.status(404).json({ error: 'Item not found' });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}
}


export const savevehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.vehicleid;
    const user = await Userlogin.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the vehicleId already exists in the user's savedVehicles array
    const existingVehicle = user.savedVehicles.some(savedVehicle => savedVehicle._id.equals(vehicleId));

    if (existingVehicle) {
      return res.status(400).send("Vehicle already saved");
    }

    // Create a new object to hold the vehicle ID
    const newVehicleObject = {
      _id: vehicleId, // Assuming _id is unique, otherwise use a different unique identifier
      myvehicles: [vehicleId] // Add the vehicleId to the myvehicles array
    };

    // Push the new vehicleObject into the savedVehicles array
    user.savedVehicles.push(newVehicleObject);

    // Update the user document with the modified savedVehicles array
    await user.save();

    // Optionally, populate the savedVehicles with vehicle details
    const finalUser = await Userlogin.findById(userId).populate({
      path: 'savedVehicles.myvehicles',
      model: 'Vehicle',
      select: 'type numberPlate numberofseats drivername driverContact',
    });

    res.status(200).json(finalUser.savedVehicles); // Return the saved vehicles array
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


export const deleteSavedVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.vehicleid;
    
    // Update the Userlogin document to remove the vehicle from savedVehicles array
    const result = await Userlogin.updateOne(
      { _id: userId }, // Query to find the document
      { $pull: { savedVehicles: { _id: vehicleId } } } // Update operation to remove the vehicle
    );

    if (result.nModified > 0) {
      res.status(404).json({ message: 'Vehicle not found or already removed.' });
    } else {
    
      res.status(200).json({ message: 'Vehicle removed successfully.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getSavedVehicles = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user.id is available and contains the user's ID
    const user = await Userlogin.findById(userId).populate({
      path: 'savedVehicles.myvehicles',
      model: 'Vehicle',
      select: 'type numberPlate numberofseats driverContact drivername', // Specify the fields you want to populate
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Filter out any undefined or null values in savedVehicles due to missing vehicle details
    const savedVehicles = user.savedVehicles.filter(vehicleObj => vehicleObj.myvehicles && vehicleObj.myvehicles.length > 0);

    res.status(200).json(savedVehicles); // Return the saved vehicles array
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


export const time = async (req, res) => {
  const { goingTime, leavingTime } = req.body;
  const eventId = req.params.eventId;
  const userId = req.user.id;

  try {
    const user = await Userlogin.findById(userId);
    const event = await admin.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const savedPlaceIndex = user.savedPlaces.findIndex(
      (savedPlace) => savedPlace.place.toString() === eventId.toString()
    );

    if (savedPlaceIndex !== -1) {
      user.savedPlaces[savedPlaceIndex].goingTime = goingTime;
      user.savedPlaces[savedPlaceIndex].leavingTime = leavingTime;
    } else {
      user.savedPlaces.push({
        place: eventId,
        goingTime,
        leavingTime,
      });
    }

    // Save to the database before sending the response
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Event preferences set successfully.',
    });
  } catch (error) {
    console.error('Error setting event preferences:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getweather=async(req,res)=>{
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  try {
    const response = await axios.get('http://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat: lat,
        lon: lon,
        appid: 'dee9a22ec42e2b753e02da5f4b5e67b8',
        units: 'metric',
      },
    });

    const weatherData = response.data;
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}

// export const time = async (req, res) => {
//   const { goingTime, leavingTime } = req.body;
//   const eventId = req.params.eventId;
//   const userId = req.user;

//   try {
//     // Find the user by userId
//     const user = await Userlogin.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Find the saved place in the user's savedPlaces array by placeId
//     const savedPlaceIndex = user.savedPlaces.findIndex(
//       (place) => place.place.toString() === eventId
//     );

//     if (savedPlaceIndex === -1) {
//       return res.status(404).json({ error: "Place not found in user's savedPlaces" });
//     }

//     // Update goingTime and leavingTime for the found place
//     user.savedPlaces[savedPlaceIndex].goingTime = goingTime;
//     user.savedPlaces[savedPlaceIndex].leavingTime = leavingTime;

//     // Save the updated user document
//     await user.save();

//     res.json({ message: "GoingTime and LeavingTime set successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


  // try {
  //   // Check if the user exists
  //   const user = await Userlogin.findById(userId);
  //   if (!user) {
  //     return res.status(404).json({ success: false, error: 'User not found' });
  //   }

  //   // Check if the event exists
  //   const event = await admin.findById(eventId);
  //   if (!event) {
  //     return res.status(404).json({ success: false, error: 'Event not found' });
  //   }

  //   // Find the index of the event in savedPlaces
  //   const savedPlaceIndex = user.savedPlaces.findIndex(
  //     (savedPlace) => savedPlace.place.toString() === eventId.toString()
  //   );

  //   // Update or add event preferences
  //   if (savedPlaceIndex !== -1) {
  //     user.savedPlaces[savedPlaceIndex].goingTime = new Date(goingTime);
  //     user.savedPlaces[savedPlaceIndex].leavingTime = new Date(leavingTime);
  //   } else {
  //     user.savedPlaces.push({
  //       place: eventId,
  //       goingTime: new Date(goingTime),
  //       leavingTime: new Date(leavingTime),
  //     });
  //   }

  //   // Save the updated user
  //   await user.save();

  //   // Format the going and leaving times
  //   const formattedGoingTime = user.savedPlaces[savedPlaceIndex].goingTime.toLocaleString('en-US', {
  //     timeZone: 'Asia/Karachi',
  //     day: 'numeric',
  //     month: 'numeric',
  //     year: 'numeric',
  //     hour: 'numeric',
  //     minute: 'numeric',
  //   });

  //   const formattedLeavingTime = user.savedPlaces[savedPlaceIndex].leavingTime.toLocaleString('en-US', {
  //     timeZone: 'Asia/Karachi',
  //     day: 'numeric',
  //     month: 'numeric',
  //     year: 'numeric',
  //     hour: 'numeric',
  //     minute: 'numeric',
  //   });

  //   // Respond with success and formatted times
  //   res.status(200).json({
  //     success: true,
  //     message: 'Event preferences set successfully.',
  //     formattedGoingTime,
  //     formattedLeavingTime,
  //   });
  // } catch (error) {
  //   console.error('Error setting event preferences:', error);
  //   res.status(500).json({ success: false, error: 'Internal Server Error' });
  // }

  // export const savevehicle = async (req, res) => {
  //   try {
  //     const userId = req.user.id;
  //     const vehicleId = req.params.vehicleid;
  //     const user = await Userlogin.findById(userId);
  
  //     if (!user) {
  //       return res.status(404).send("User not found");
  //     }
  
  //     // Check if the vehicleId already exists in the user's savedVehicles array
  //     const existingVehicle = user.savedVehicles.find(savedVehicle => savedVehicle._id === vehicleId);
  
  //     if (existingVehicle) {
  //       return res.status(400).send("Vehicle already saved");
  //     }
  
  //     // Create a new object to hold the vehicle ID
  //     const newVehicleObject = {
  //       _id: vehicleId, // Assuming _id is unique, otherwise use a different unique identifier
  //       myvehicles: [vehicleId] // Add the vehicleId to the myvehicles array
  //     };
  
  //     // Push the new vehicleObject into the savedVehicles array
  //     user.savedVehicles.push(newVehicleObject);
  
  //     // Update the user document with the modified savedVehicles array
  //     await user.save();
  
  //     // Optionally, populate the savedVehicles with vehicle details
  //     const finalUser = await Userlogin.findById(userId).populate({
  //       path: 'savedVehicles.myvehicles',
  //       model: 'Vehicle',
  //       select: 'type numberPlate numberofseats drivername driverContact',
  //     });
  
  //     res.status(200).json(finalUser.savedVehicles); // Return the saved vehicles array
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send("Internal Server Error");
  //   }
  // };