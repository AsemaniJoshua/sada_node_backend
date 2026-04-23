// Importing necessary modules and files
import express from "express";
import cors from "cors";
import { customError } from "./utils/error/custom_error.js";
import authRouter from "./routers/auth/auth.js";
import publicHomeRouter from "./routers/public/home.js";
import publicAboutRouter from "./routers/public/about.js";
import publicProjectRouter from "./routers/public/projects.js";
import publicBlogRouter from "./routers/public/blog.js";
import adminHomeRouter from "./routers/admin/home.js";
import adminAboutRouter from "./routers/admin/about.js";
import adminProjectRouter from "./routers/admin/projects.js";
import adminBlogRouter from "./routers/admin/blog.js";


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
// Public routes
app.use('/api/home', publicHomeRouter);
app.use('/api/about', publicAboutRouter);
app.use('/api/projects', publicProjectRouter);
app.use('/api/blog', publicBlogRouter);
// Admin routes
app.use('/api/admin/home', adminHomeRouter);
app.use('/api/admin/about', adminAboutRouter);
app.use('/api/admin/projects', adminProjectRouter);
app.use('/api/admin/blog', adminBlogRouter);


// Error handling middleware
app.use(customError);


// Starting the server and listening on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});