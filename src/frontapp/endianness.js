export default function () {
  var heap = new ArrayBuffer(0x10000);
  var i32 = new Int32Array(heap);
  var u32 = new Uint32Array(heap);
  var u16 = new Uint16Array(heap);
  u32[64] = 0x7FFF0100;
  var typedArrayEndianness;
  if (u16[128] === 0x7FFF && u16[129] === 0x0100) typedArrayEndianness = 'big endian';
  else if (u16[128] === 0x0100 && u16[129] === 0x7FFF) typedArrayEndianness = 'little endian';
  else typedArrayEndianness = 'unknown! (a browser bug?) (short 1: ' + u16[128].toString(16) + ', short 2: ' + u16[129].toString(16) + ')';
  return typedArrayEndianness;
}
