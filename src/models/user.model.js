import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['recruiter', 'applicant'], required: true },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    
    phone: { type: String },
    bio: { type: String },

    // Applicant specific fields
    skills: [{ type: String }],
    education: [{
      institution: { type: String },
      degree: { type: String },
      field: { type: String },
      startYear: { type: Number },
      endYear: { type: Number }
    }],
    workExperience: [{
      company: { type: String },
      position: { type: String },
      description: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      current: { type: Boolean, default: false }
    }],
    resume: { type: String }, 
    
    // Recruiter specific fields
    companyName: { type: String },
    companyWebsite: { type: String },
    companyDescription: { type: String },
    companyLogo: { type: String } 
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
