import {Request, Response} from 'express';
import {AddReviewDto} from '../interfaces/review/dto/add-review.dto';
import * as reviewRepo from '../repositories/reviews.repository';
import {DeleteReviewDto} from '../interfaces/review/dto/delete-review.dto';
import {UserInteractionDto} from '../interfaces/review/recombee.interface';
import {prepareAuth0UserId} from '../utils/recombee.utils';
import {createProducer} from '../config/kafka.config';
import {Event} from '../interfaces/event.interface';

const RECOMMENDATION_EVENTS_TOPIC = process.env.KAFKA_TOPIC_PREFIX + 'recommendation-events';

export const getReviews = async (req: Request, res: Response) => {
    const result = await reviewRepo.getReviews(req.params.bookId);
    if (result.errors) {
        return res.status(400).json({errors: result.errors});
    }
    return res.json({success: result.data});
};

export const putReview = async (req: Request, res: Response) => {
    const addReviewDto: AddReviewDto = {
        id: req.body.id,
        bookId: req.body.bookId,
        userId: (req as any).user.sub,
        rating: req.body.rating,
        reviewText: req.body.reviewText,
    };

    const result = await reviewRepo.putReview(addReviewDto);
    if (result.errors) {
        return res.status(400).json({errors: result.errors});
    }

    const rating = Number.parseInt(addReviewDto.rating, 10);
    const ratingInteraction: UserInteractionDto = {
        bookId: addReviewDto.bookId,
        userId: prepareAuth0UserId(addReviewDto.userId),
        rating,
        recommId: String.apply(req.query.rid),
    };

    const ratingInteractionEvent: Event = {
        type: 'UPDATE_BOOK_RATING',
        payload: ratingInteraction,
        date: '' + Date.now(),
    };

    createProducer().then(producer => producer.send({
        topic: RECOMMENDATION_EVENTS_TOPIC,
        messages: [{key: '' + Date.now(), value: JSON.stringify(ratingInteractionEvent)}],
    }));
    return res.json({success: result.data});
};

export const deleteReview = async (req: Request, res: Response) => {
    const deleteReviewDto: DeleteReviewDto = {
        bookId: req.body.bookId,
        userId: (req as any).user.sub,
    };

    const ratingInteractionEvent: Event = {
        type: 'DELETE_BOOK_RATING',
        payload: {
            bookId: deleteReviewDto.bookId,
            userId: prepareAuth0UserId(deleteReviewDto.userId),
        },
        date: '' + Date.now(),
    };

    createProducer().then(producer => producer.send({
        topic: RECOMMENDATION_EVENTS_TOPIC,
        messages: [{key: '' + Date.now(), value: JSON.stringify(ratingInteractionEvent)}],
    }));

    const result = await reviewRepo.deleteReview(deleteReviewDto);
    if (result.errors) {
        return res.status(400).json({errors: result.errors});
    }
    return res.json({success: result.data});
};
