const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: 'Operations Staff'
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    bufferCommands: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

const Admin = mongoose.model('Admin', adminSchema, 'admins');

module.exports = {
  Admin
};
