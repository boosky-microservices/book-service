import bookRoutes from './book.routes';
import { Router } from 'express';

const routes = Router();
routes.use('/books', bookRoutes);

export default routes;
