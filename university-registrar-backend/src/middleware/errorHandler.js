const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Default error
    let error = { ...err };
    error.message = err.message;
    
    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
        error.message = 'Duplicate entry. Record already exists.';
        error.statusCode = 409;
    }
    
    // MySQL foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        error.message = 'Cannot delete record because it is referenced by other records.';
        error.statusCode = 400;
    }
    
    // MySQL data too long error
    if (err.code === 'ER_DATA_TOO_LONG') {
        error.message = 'Data provided is too long for the field.';
        error.statusCode = 400;
    }
    
    // Validation error
    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(val => val.message).join(', ');
        error.statusCode = 400;
    }
    
    const statusCode = error.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        message: error.message || 'Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        code: err.code
    });
};

module.exports = errorHandler;