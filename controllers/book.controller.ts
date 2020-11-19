import * as booksRepo from '../repositories/googleBooks.repository';
import { Request, Response } from 'express';
import { FindBookDto } from '../interfaces/book/dto/find-book.dto';
import { prepareAuth0UserId } from '../common/helper.common';
import {Event} from '../interfaces/event.interface';
import {Events} from '../interfaces/events.enum';
import {createProducer} from '../config/kafka.config';
const fillRecommendationDb = process.env.FILL_DB || false;

const RECOMMENDATION_EVENTS_TOPIC = process.env.KAFKA_TOPIC_PREFIX + 'recommendation-events';

export const searchBooks = async (req: Request, res: Response) => {
  const params: FindBookDto = req.query;
  if (!params.q) {
    return res.status(400).json();
  }
  const result = await booksRepo.findBook(params);

  if (result.errors) {
    return res.status(400).json({ errors: result.errors });
  }

  if (fillRecommendationDb) {
    const sendBookBulkEvent: Event = {
      type: Events.SEND_BOOK_BULK,
      payload: {
        books: result.data.items,
        totalItems: result.data.totalItems,
      },
      date: '' + Date.now(),
    };

    createProducer().then(producer => producer.send({
      topic: RECOMMENDATION_EVENTS_TOPIC,
      messages: [{key: sendBookBulkEvent.date, value: JSON.stringify(sendBookBulkEvent)}],
    }));
  }

  return res.json(result.data);
};

export const getBook = async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const { rid } = req.query; // recommendation Id
  const userId = prepareAuth0UserId((req as any).user?.sub) || req.cookies.sess || 'noId';
  const result = { reviews: [], rating: 0, volume: { id: '', volumeInfo: {} }};
  if (!bookId) {
    return res.status(400).json();
  }
  const bookResult = await booksRepo.findBookById(bookId);
  if (bookResult.errors) {
    return res.status(400).json({ errors: bookResult.errors });
  }
  if (!bookResult.data._id) {
    const sendBookBulkEvent: Event = {
      type: Events.SEND_BOOK,
      payload: {
        book: bookResult.data,
      },
      date: '' + Date.now(),
    };

    createProducer().then(producer => producer.send({
      topic: RECOMMENDATION_EVENTS_TOPIC,
      messages: [{key: sendBookBulkEvent.date, value: JSON.stringify(sendBookBulkEvent)}],
    }));
  }

  const sendViewInteractionEvent: Event = {
    type: Events.VIEW_INTERACTION,
    payload: { userId, bookId, recommId: rid },
    date: '' + Date.now(),
  };

  createProducer().then(producer => producer.send({
    topic: RECOMMENDATION_EVENTS_TOPIC,
    messages: [{key: sendViewInteractionEvent.date, value: JSON.stringify(sendViewInteractionEvent)}],
  }));

  result.volume.id = bookResult.data.id;
  result.volume.volumeInfo = bookResult.data.volumeInfo;
  result.rating = bookResult.data.rating || 0;
  return res.json(result);
};

export const getPopularBooks = async (req: Request, res: Response) => {
  const result = await booksRepo.getPopularBooks(6);
  if (result.errors) {
    return res.status(400).json({ errors: result.errors });
  }
  return res.json(result.data);
};
