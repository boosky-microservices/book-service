import express from 'express';
import Logger from './config/logger.config';
import methodOverride from 'method-override';
import { buildConnection } from './config/database.config';
import { loadEnvVariables } from './config/dotenv.config';
import bodyParser from 'body-parser';
import cors from 'cors';
import {APIGatewayProxyHandler} from 'aws-lambda';
import serverless from 'serverless-http';
import cookieParser from 'cookie-parser';
import { cookieMiddleware } from './config/auth.config';

if (process.env.NODE_ENV === 'development') {
// Load environment variables
    loadEnvVariables();
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());
app.use(cookieParser());
app.use(cookieMiddleware);

import bookRoutes from './routes/book.routes';

app.use('/books', bookRoutes);

const PORT = process.env.PORT || 3001;

buildConnection()
    .then(() => {
        Logger.info('Connection to DB Established');
        app.listen(PORT, () => {
            Logger.info('Boosky book service listening on http://localhost:' + PORT);
        });
    })
    .catch(err => {
        Logger.error('Error on start: ' + err.stack);
        process.exit(1);
    });

// @ts-ignore
export const handler: APIGatewayProxyHandler = serverless(app);
