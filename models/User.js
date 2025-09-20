// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toHexString(), unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' }, // you can enforce enum if you want
  salary: { type: Number, default: 0 },
  password: { type: String, required: true },
  group: { type: String, default: '' },
  address: { type: String, default: '' },
  creationtimestamp: { type: Date, default: Date.now }
});

// Avoid model recompilation in dev
export default mongoose.models.User || mongoose.model('User', UserSchema);
