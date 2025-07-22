const express = require('express');
const dotenv = require('dotenv');
const router = require('./routes/sbiRoutes');
const kotakrouter = require('./routes/kotakRoutes');
const cors=require('cors');
const hdfcrouter = require('./routes/hdfcRoutes');
const icicirouter = require('./routes/ICICIRoutes');

dotenv.config();
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use('/api/sbi', router);
app.use('/api/kotak',kotakrouter);
app.use('/api/hdfc',hdfcrouter);
app.use('/api/icici',icicirouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:5000`);
});

