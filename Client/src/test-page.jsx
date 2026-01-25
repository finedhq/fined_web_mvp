import React from 'react';

export default function TestPage() {
    return (
        <div style={{ padding: '50px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
            <h1 style={{ color: 'red', fontSize: '48px' }}>✅ REACT IS WORKING!</h1>
            <p style={{ fontSize: '24px' }}>If you can see this, React is rendering correctly.</p>
            <p style={{ fontSize: '18px' }}>The issue might be with Auth0 or other dependencies.</p>
        </div>
    );
}
