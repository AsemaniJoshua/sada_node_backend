// Importing necessary modules and files
import express from "express";
import cors from "cors";
import { customError } from "./utils/error/custom_error.js";
import authRouter from "./routers/auth/auth.js";
import publicHomeRouter from "./routers/public/home.js";
import publicAboutRouter from "./routers/public/about.js";
import publicProjectRouter from "./routers/public/projects.js";
import publicBlogRouter from "./routers/public/blog.js";
import publicGalleryRouter from "./routers/public/gallery.js";
import publicContactRouter from "./routers/public/contact.js";
import publicTestimonialsRouter from "./routers/public/testimonials.js";
import publicFAQsRouter from "./routers/public/faqs.js";
import publicJourneyRouter from "./routers/public/journey.js";
import publicAnnouncementsRouter from "./routers/public/announcements.js";
import publicLeadershipRouter from "./routers/public/leadership.js";
import publicPaymentsRouter from "./routers/public/payments.js";
import publicMembershipRouter from "./routers/public/membership.js";
import publicHeroRouter from "./routers/public/hero.js";
import publicEventsRouter from "./routers/public/events.js";
import adminHomeRouter from "./routers/admin/home.js";
import adminAboutRouter from "./routers/admin/about.js";
import adminProjectRouter from "./routers/admin/projects.js";
import adminBlogRouter from "./routers/admin/blog.js";
import adminGalleryRouter from "./routers/admin/gallery.js";
import adminContactRouter from "./routers/admin/contact.js";
import adminTestimonialsRouter from "./routers/admin/testimonials.js";
import adminFAQsRouter from "./routers/admin/faqs.js";
import adminJourneyRouter from "./routers/admin/journey.js";
import adminAnnouncementsRouter from "./routers/admin/announcements.js";
import adminLeadershipRouter from "./routers/admin/leadership.js";
import adminPaymentsRouter from "./routers/admin/payments.js";
import adminStatisticsRouter from "./routers/admin/statistics.js";
import adminMembershipRouter from "./routers/admin/membership.js";
import adminHeroRouter from "./routers/admin/hero.js";
import adminEventsRouter from "./routers/admin/events.js";
import adminUserRouter from "./routers/admin/user.js";


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
app.use('/api/gallery', publicGalleryRouter);
app.use('/api/contact', publicContactRouter);
app.use('/api/testimonials', publicTestimonialsRouter);
app.use('/api/faqs', publicFAQsRouter);
app.use('/api/journey', publicJourneyRouter);
app.use('/api/announcements', publicAnnouncementsRouter);
app.use('/api/leadership', publicLeadershipRouter);
app.use('/api/payments', publicPaymentsRouter);
app.use('/api/membership', publicMembershipRouter);
app.use('/api/hero', publicHeroRouter);
app.use('/api/events', publicEventsRouter);
// Admin routes
app.use('/api/admin/home', adminHomeRouter);
app.use('/api/admin/about', adminAboutRouter);
app.use('/api/admin/projects', adminProjectRouter);
app.use('/api/admin/blog', adminBlogRouter);
app.use('/api/admin/gallery', adminGalleryRouter);
app.use('/api/admin/contact', adminContactRouter);
app.use('/api/admin/testimonials', adminTestimonialsRouter);
app.use('/api/admin/faqs', adminFAQsRouter);
app.use('/api/admin/journey', adminJourneyRouter);
app.use('/api/admin/announcements', adminAnnouncementsRouter);
app.use('/api/admin/leadership', adminLeadershipRouter);
app.use('/api/admin/payments', adminPaymentsRouter);
app.use('/api/admin/statistics', adminStatisticsRouter);
app.use('/api/admin/membership', adminMembershipRouter);
app.use('/api/admin/hero', adminHeroRouter);
app.use('/api/admin/events', adminEventsRouter);
app.use('/api/admin/user', adminUserRouter);



// Default route for testing server
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Sada API',
        version: '1.0.0',
        data: {
            timestamp: new Date().toISOString(),
             uptime: process.uptime(),
             environment: process.env.NODE_ENV || 'Production',
        }
    });
});


// Error handling middleware
app.use(customError);


// Starting the server and listening on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});