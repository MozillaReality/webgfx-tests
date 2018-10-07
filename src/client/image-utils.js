function nearestNeighbor (src, dst) {
  let pos = 0

  for (let y = 0; y < dst.height; y++) {
    for (let x = 0; x < dst.width; x++) {
      const srcX = Math.floor(x * src.width / dst.width)
      const srcY = Math.floor(y * src.height / dst.height)

      let srcPos = ((srcY * src.width) + srcX) * 4

      dst.data[pos++] = src.data[srcPos++] // R
      dst.data[pos++] = src.data[srcPos++] // G
      dst.data[pos++] = src.data[srcPos++] // B
      dst.data[pos++] = src.data[srcPos++] // A
    }
  }
}

export function resizeImageData(srcImageData, newImageData) {
  nearestNeighbor(srcImageData, newImageData);
}