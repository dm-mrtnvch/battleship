export const randomInteger = (min: number, max: number) => {
  let random = min + Math.random() * (max + 1 - min)
  return Math.floor(random)
}
