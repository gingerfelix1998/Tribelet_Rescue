import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import MyTeams from "./pages/MyTeams";
import CreateKit from "./pages/CreateKit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="contact" element={<Contact />} />
          <Route path="account" element={<Account />} />
          <Route path="my-teams" element={<MyTeams />} />
          <Route path="create-kit" element={<CreateKit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

