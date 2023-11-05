export const binaryToBase64 = (binary: string, mimeType: string): string => {
  const imageBuffer = Buffer.from(binary, 'binary');
  const base64Image = imageBuffer.toString('base64');
  return `data:${mimeType};base64,${base64Image}`;
};
