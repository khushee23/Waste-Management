export const analyzeImage = async (imageUrl) => {
  // mock AI: returns 0..100
  const _ = imageUrl
  return Math.floor(Math.random() * 101)
}

