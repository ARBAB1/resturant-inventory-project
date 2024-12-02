const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

dotenv.config();

const userRoutes = require('./routes/user-route');  

app.use(cors());
app.use(express.json());
app.use(userRoutes);  


app.get('/', (req, res) => {
    res.send('Welcome to Restaurant Management');
});

app.listen(process.env.PORT, () => {
    console.log(`Worker ${process.pid} is running on port ${process.env.PORT}`);
});
