import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [num, setNum] = useState(3);

  return (
    <div
      onClick={() => {
        setNum((prevNum) => prevNum + 1);
        setNum((prevNum) => prevNum + 1);
        setNum((prevNum) => prevNum + 1);
      }}
    >
      {num}
    </div>
  );
}

const root = ReactDOM.createRoot(document.querySelector('#root') as Element);

root.render(<App />);
