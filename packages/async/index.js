export const tapP = (fn) => (value) => {
  fn(value)
  return value
}
export const tapError = (fn) => (value) => {
  fn(value)
  return Promise.reject(value)
}
export const logP = (fn) => tapP((value) => console.log(fn(value)))
export const pipeP = (...fns) => fns.reduce((prev, curr) => prev.then(curr), Promise.resolve())
