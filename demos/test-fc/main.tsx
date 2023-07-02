import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [num, setNum] = useState(0);
  return (
    <div
      onClick={() => {
        setNum((prevNum) => prevNum + 2);
      }}
    >
      {num}
    </div>
  );
}

function Child() {
  return <span>big-react</span>;
}

const root = ReactDOM.createRoot(document.querySelector('#root') as Element);

root.render(<App />);
