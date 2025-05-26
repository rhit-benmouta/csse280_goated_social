// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainPage from './pages/Main';
import './styles.css'; // Uses your styles

function Layout({ children }) {
  return (
    <div className="app-container">
      <header>
        <h1>TA-Student Social Hub</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/signup">Sign Up</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer>&copy; 2025 TA-Student Social Hub.</footer>
      <footer> Made by Taha Benmoussa & Michael Meunier.</footer>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h2>Welcome!</h2>
      <p>Use the buttons below to get started.</p>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/signup')}>Sign Up</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/main" element={<MainPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
