import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
        </div>
    );
};

export default LoadingSpinner;