import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [num, setNum] = useState(0);

  return (
    <ul onClick={() => setNum((prevNum) => prevNum + 1)}>
      <li>a</li>
      <li>b</li>
      {num % 2 === 0 ? (
        <>
          <li>item-1</li>
          <>
            <li>item-2</li>
            <>
              <li>item-3</li>
              <li>item-4</li>
            </>
            <li>item-5</li>
          </>
          <li>item-6</li>
        </>
      ) : (
        <li>test</li>
      )}
      <li>c</li>
      <li>d</li>
    </ul>
  );
}

const root = ReactDOM.createRoot(document.querySelector('#root') as Element);

root.render(<App />);
