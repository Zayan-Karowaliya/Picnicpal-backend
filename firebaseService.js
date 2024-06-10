import admin from 'firebase-admin';
import serviceAccount from './picnicpal-75f0a-firebase-adminsdk-orbue-8bea2c058d.json' assert { type: 'json' };


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin
