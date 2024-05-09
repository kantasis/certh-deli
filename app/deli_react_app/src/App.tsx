// import { useState } from 'react'
// import './App.css'
import './css/style.css'

import Header from './components/Header';
import TabbedList from './components/TabbedList';

function App() {

  return (
    <>
      <div className="container">
        <Header />
        <h1>Grafana Powered</h1>
        <TabbedList />
      </div>
    </>
  );
}

export default App
