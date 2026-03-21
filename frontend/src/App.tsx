import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Placeholder for Register Page */}
        <Route path="/register" element={<div className="p-10 text-primary-700">Registration Page Coming Soon</div>} />
        
        {/* Placeholder for Login Page */}
        <Route path="/login" element={<div className="p-10 text-primary-700">Login Page Coming Soon</div>} />

        {/* Redirect root to Register */}
        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;