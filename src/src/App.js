import { ThemeProvider } from "@mui/material";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CryptoPrice from "./components/CryptoPrice";
import { logout } from "./components/Firebase";
import Google from "./components/Google";
import Logout from "./components/Logout";
import Services from "./components/Services";
import Sidebar from "./components/Sidebar";
import Temperature from "./components/Temperature";
import Widgets from "./components/Widgets";
import YoutubeWidget from "./components/Youtube";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ColorModeContext, useMode } from "./theme";

const App = () => {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" onEnter={() => logout} element={<Logout />} />
          </Routes>
          <div className="app">
            <Sidebar isSidebar={isSidebar} />
            <main className="content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/widgets" element={<Widgets />} />
                <Route path="/widget/CryptoPrice" element={<CryptoPrice />} />
                <Route path="/widget/Temperature" element={<Temperature />} />
                <Route path="/widget/Youtube" element={<YoutubeWidget />} />
                <Route path="/google" element={<Google />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
