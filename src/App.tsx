import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Box, Container } from '@chakra-ui/react';
import Chatroom from './pages/default/Chatroom';
import { BrowserRouter, HashRouter, Route, Router, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/login/Registration';
import { AuthProvider } from './contexts/AuthContext';
import Default from './layouts/default';

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Box p={5}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chatroom" element={<Default />} />
            <Route path="/chatroom/:chatroomId" element={<Default />} />
          </Routes>
          </Box>
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;
