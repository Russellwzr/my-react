import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [num, setNum] = useState(0);
  const arr =
    num % 2 === 0
      ? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
      : [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];

  return (
    <>
      <ul onClick={() => setNum((prevNum) => prevNum + 1)}>
        <>
          <li>a</li>
          <>
            <li>f1</li>
            <li>f2</li>
          </>
          <li>b</li>
          {arr}
        </>
      </ul>
    </>
  );
}

const root = ReactDOM.createRoot(document.querySelector('#root') as Element);

root.render(<App />);
