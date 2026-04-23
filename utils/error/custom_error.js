// the error middleware will catch any error thrown in the application and send a response to the client with the error message and status code
import { AppError } from "./AppError.js";
import "dotenv/config";

const customError = (err, req, res, next) => {
    // Extract error details with defaults
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let isOperational = err.isOperational || false;

    // Error response object
    const errorResponse = {
        "success": false,
        status: statusCode,
        message: message,
        isOperational: isOperational
    };

    // checking if the node environment is development or production and sending the error response accordingly
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);

};

export { customError };