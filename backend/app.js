const express = require('express');
const app = express();
const parentRoutes = require('./routes/parentRoutes')
const childRoutes = require('./routes/childRoutes')
const cors = require('cors');
require('dotenv').config();

const errorHandler = (err, req, res, next) => { 
    console.error(err); res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" }); 
};
app.use(express.json())
app.use(cors())
app.use("/api", parentRoutes)
app.use("/api", childRoutes);
app.use(errorHandler);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("Server running on PORT: ", PORT);
});