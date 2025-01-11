import React from 'react';

const NotFoundPage: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
        </div>
    );
};

export default NotFoundPage;

export const metadata = {
    title: '404 - Not Found',
    description: 'The page you are looking for does not exist.',
};