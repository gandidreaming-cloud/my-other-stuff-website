import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CryptoDonations from "./pages/CryptoDonations";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/crypto-donations" element={<CryptoDonations />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;