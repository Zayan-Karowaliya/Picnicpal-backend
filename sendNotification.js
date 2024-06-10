
import admin from "./firebaseService.js";

const registrationToken = 'cluhkhzZQdW5jKEjOz9fdn:APA91bHqJ2b4xKbtxSUvMtxBQQj8RIXxmUN0PSXedVxXnVsegCgXeXXsGTQ-Tj8My1vR0rWeN8PnwZpfnbNk3nC3rPeLzTNRKvojjfzUOLP6fWu6Y1K21pUTBMZJquj0gEZmf8XoXj7o';



const SendNotification = (message) => {
    admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
}

export default SendNotification


// const message = {
//   notification: {
//     title: 'Hello World',
//     body: 'This is a test notification',
//   },
//   token: registrationToken,
// };