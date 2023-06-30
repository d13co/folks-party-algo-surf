import { useState, useCallback } from 'react';

export default function Copyable({children, value, ...rest}) {
  const [label, setLabel] = useState('Copy');
  const copy = useCallback(() => {
    const text = value ?? children.join('');
    debugger;
    navigator.clipboard.writeText(text);
    setLabel('Copied!');
    setTimeout(() => setLabel('Copy'), 1500);
  }, [children, value]);
  return <div {...rest}>{children}<button style={{marginLeft: '0.5rem'}} onClick={copy}>{label}</button></div>;
}
