// Importing necessary modules and files
import express from "express";
import cors from "cors";
import { customError } from "./utils/error/custom_error.js";
import authRouter from "./routers/auth/auth.js";


// Initializing the express application
const app = express();

// Setting the port for the server to listen on
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON data from the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: "*",
    methods: ["*"],
    allowedHeaders: ["*"],
    credentials: true
}));


// Importing routes
app.use('/api/auth', authRouter);


// Error handling middleware
app.use(customError);


// Starting the server and listening on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});