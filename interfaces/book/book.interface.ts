import { Document } from 'mongoose';

export interface VolumeCore {
  title?: string;
  subtitle?: string;
  publisher?: string;
  description?: string;
  pageCount?: number;
  authors?: string[];
  categories?: string[];
  thumbnail?: string;
  publishedDate?: string;
}

/**
 * Individual volume, same as the google books api interface
 */
interface IVolume {
  rating?: number;
  volumeInfo?: {
    imageLinks?: {
      thumbnail?: string;
    },
  } & VolumeCore;
}
/**
 * Used for performing book search
 */
export interface Volumes {
  totalItems?: number;
  items?: Volume[];
}

export interface VolumeModel extends IVolume, Document { }

export interface Volume extends IVolume {
  _id?: string;
  id?: string;
}
