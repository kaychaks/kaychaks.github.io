export const copyBytes = (bytes: Uint8Array): Uint8Array => new Uint8Array(bytes);

export const toString = (bytes: Uint8Array): string => {
  const str = new TextDecoder().decode(bytes);
  return str;
};

export const timingSafeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) {
    // Ensure constant time by comparing anyway
    const max = Math.max(a.length, b.length);
    let diff = 0;
    for (let i = 0; i < max; i++) {
      const av = (i < a.length ? a[i] : 0) ?? 0;
      const bv = (i < b.length ? b[i] : 0) ?? 0;
      diff |= av ^ bv;
    }
    return diff === 0;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    diff |= av ^ bv;
  }
  return diff === 0;
};


