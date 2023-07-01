import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [num, setNum] = useState(666);
  return <div>{num}</div>;
}

const root = ReactDOM.createRoot(document.querySelector('#root') as Element);

root.render(<App />);
