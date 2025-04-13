import { Schema, model, models, Document, Model } from "mongoose";

// 1. Definición de la interfaz TypeScript para el documento User
export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  photo: string;
  firstName?: string;
  lastName?: string;
  planId: number;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Definición del esquema Mongoose
const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: [true, 'Clerk ID is required'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  photo: {
    type: String,
    required: [true, 'Photo URL is required'],
    validate: {
      validator: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Photo must be a valid URL'
    }
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  planId: {
    type: Number,
    default: 1,
    enum: {
      values: [1, 2, 3],
      message: 'Plan ID must be either 1, 2, or 3'
    }
  },
  creditBalance: {
    type: Number,
    default: 10,
    min: [0, 'Credit balance cannot be negative']
  },
}, {
  timestamps: true, // Habilita createdAt y updatedAt automáticamente
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v; // Elimina __v del output
      ret.id = ret._id; // Añade id como alias de _id
      delete ret._id; // Elimina _id del output
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// 3. Definición del modelo con tipado fuerte
const User: Model<IUser> = models?.User || model<IUser>("User", UserSchema);

export default User;