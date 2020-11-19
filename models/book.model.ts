import { Schema, model } from 'mongoose';
import {Volume, VolumeModel} from '../interfaces/book/book.interface';

interface VolumeDocument extends Volume {
  updateRating: () => void;
}
export const BookSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    volumeInfo: {
      title: String,
      subtitle: String,
      publisher: String,
      description: String,
      pageCount: Number,
      authors: [String],
      categories: [String],
      thumbnail: String,
      publishedDate: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true },
);

export default model<VolumeModel>('Book', BookSchema);
