import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import adminRouter from './routes/newsletters.js';
import homeRouter from './routes/home.js'
import courseRouter from './routes/courses.js';
import moduleRouter from './routes/modules.js';
import cardsRouter from './routes/cards.js';
import articleRouter from './routes/articles.js';
import exptrackerRouter from './routes/expenseTracker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: ['https://fined-web.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/admin', adminRouter);
app.use('/api/home', homeRouter);
app.use('/api/courses', courseRouter);
app.use('/api/modules', moduleRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/articles', articleRouter);
app.use('/api/fin-tools/expensetracker', exptrackerRouter)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
