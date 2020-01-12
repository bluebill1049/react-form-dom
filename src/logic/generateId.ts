const byte = 16;

export default () => {
  const d = performance.now() * 1000;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * byte) % byte | 0;
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(byte);
  });
};
