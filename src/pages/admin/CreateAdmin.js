import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { signupAdmin } from '../../services/api';

const CreateAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await signupAdmin({ name, identifier, password });
      setSuccess('Admin created successfully!');
      setName('');
      setIdentifier('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data || 'Failed to create admin');
    }
  };

  const renderErrorMessages = (errorObj) => {
    if (typeof errorObj === 'string') return errorObj;
    if (!errorObj || typeof errorObj !== 'object') return null;
    // Flatten and stringify all error messages
    const messages = Object.values(errorObj).flat().map(msg =>
      typeof msg === 'string'
        ? msg
        : typeof msg === 'object'
          ? JSON.stringify(msg)
          : String(msg)
    );
    return (
      <ul style={{ color: 'red' }}>
        {messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
      </ul>
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
        Create New Admin
      </Typography>
      
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', maxWidth: 600 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField 
            label="Identifier (Email)" 
            fullWidth 
            required 
            margin="normal" 
            value={identifier} 
            onChange={e => setIdentifier(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField 
            label="Name" 
            fullWidth 
            required 
            margin="normal" 
            value={name} 
            onChange={e => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField 
            label="Password" 
            type="password" 
            fullWidth 
            required 
            margin="normal" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {error && <Alert severity="error">{renderErrorMessages(error)}</Alert>}
          {success && <div style={{ color: 'green' }}>
            {typeof success === 'string' ? success : JSON.stringify(success)}
          </div>}
          
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ 
              mt: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              '&:hover': { background: 'linear-gradient(135deg, #1565c0, #1976d2)' }
            }}
          >
            Create Admin
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateAdmin; 