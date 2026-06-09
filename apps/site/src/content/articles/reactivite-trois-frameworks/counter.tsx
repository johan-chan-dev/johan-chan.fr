import { useState } from 'react';
export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount((c) => c - 1)} aria-label="moins">−</button>
      <output>{count}</output>
      <button onClick={() => setCount((c) => c + 1)} aria-label="plus">+</button>
    </>
  );
}
