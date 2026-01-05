import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '48px', color: '#28a745', marginBottom: '20px' }}>
        ✓
      </div>
      
      <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
        Registration Successful!
      </h2>
      
      <p style={{ color: '#6c757d', marginBottom: '30px', lineHeight: '1.5' }}>
        Thank you for registering with us. Your account has been created successfully. 
        You can now login to access your dashboard.
      </p>

      <button
        onClick={() => navigate('/login')}
        style={{
          padding: '12px 30px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          marginRight: '10px'
        }}
      >
        Go to Login
      </button>

      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 30px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Home
      </button>
    </div>
  );
};

export default ThankYou;