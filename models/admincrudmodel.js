import { Double, Int32 } from "mongodb"
import mongoose from "mongoose"


const admincrudSchema=mongoose.Schema(
        {
          EventType:{
           type:String,
          
          },
            NameOfPlace: {
              type: String,
            
            },
           
            Brief: {
                type: String,
               
              },
            Description:{
              type:String
            },
          location:{
            type:String
          },
          addby:{
            type:String,
            default:'Admin'
          },
            NumberOfPeople:{
            type:Number,
            default:0
            },
         from:{
          type:String
         },
         to:{
          type:String
         },
         date:{
          type:String
         },
         latitude:{
          type:String
         },
         longitutde:{
          type:String
         },
         
            image: String,
          
            sharedFacts: [
              {
                user: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'Userlogin',
                },
                fact: String,
                timestamp: {
                  type: Date,
                  default: Date.now,
                },
              },
            ],
           
          
             
           
        
    },{timestamps:true}
)
const admin=mongoose.model("admin",admincrudSchema)
export default admin