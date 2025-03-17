const express = require('express');
const morgan = require('morgan')
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDb = require('./src/config/db.js');
// const Admin = require('./src/models/admin.model.js');
const adminRoutes = require('./src/routes/admin.routes.js');
const userRoutes = require('./src/routes/user.routes.js');

dotenv.config();

const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use(morgan('dev'));


app.get('/', (req, res) => {
    res.send('Welcome to Handy Bank App')
});

app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/user', userRoutes)

app.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
})