import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
    {
        username: { type: String, requieed: [true, "Please enter username"] },
        email: { type: String, required: [true, "please enter the email"] },
        password: { type: String, required: [true, "please enter the password"] },
        role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' }
    });
export default mongoose.model("User", UserSchema);
// export default model('DocumentHistory', DocumentHistorySchema);



