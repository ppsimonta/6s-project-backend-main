const express = require('express');
const dotenv = require('dotenv').config()
const cors = require('cors')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const authService = require('./services/authService');
const roomService = require('./services/roomService');
const questionService = require('./services/questionService');
const auditService = require('./services/auditService');
const {router: authRouter} = require('./routes/authRoutes')
const roomRoutes = require('./routes/roomRoutes')
const auditRoutes = require('./routes/auditRoutes')

const app = express();



// database connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Database Connected'))
.catch(() => console.log('Database not connected', err))

//middleware
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))





const services = (req, res, next) => {
    req.services = {authService, roomService, questionService, auditService}
    next()
}

app.use('/api/v1', services, authRouter )
app.use('/api/v1/room', services, roomRoutes )
app.use('/api/v1/audit', services, auditRoutes )

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`))
