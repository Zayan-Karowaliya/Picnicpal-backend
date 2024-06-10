
import mongoose from "mongoose"
import bcrypt from 'bcrypt';
// const placeTimeSchema = new mongoose.Schema({
//   place: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
//   goingTime: { type: Date },
//   leavingTime: { type: Date },
// });
const userloginsignupSchema=mongoose.Schema(
        {
            username: {
              type: String,
             
            },
           
            email: {
                type: String,
              },
            password: {
              type: String,
           
              // maxlength: 50,
              minlength: 3,
            },
            role:{
              type :String , 
            } ,
            age: {
              type: Number,
              default: null,
            },
            gender: {
              type: String,
             
              default: null,
            },
            data: {
              // Additional user data
              type: String,
              default: null,
            },
            savedPlaces: [
              {
                place: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'admin',
                },
                goingTime: {
                  type: String,
                },
                leavingTime: {
                  type: String,
                },
              
              },
              
            ],
            image: String,
            equipmentChecklist: [
              {
                name: String,
                description: String,
                status: {
                  type: String,
                  enum: ['done', 'not done'],
                  default: 'not done',
                },
              },
              
            ],
            sharedFacts: [
              {
                fact: String,
                timestamp: {
                  type: Date,
                  default: Date.now,
                },
              },
            ], 
            savedVehicles: [
              {
                myvehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }]
              },
            ],
          
        
    }
)
userloginsignupSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};
const Userlogin=mongoose.model("Userlogin",userloginsignupSchema)
export default Userlogin