
const cache = new Map()

export const has=listener=>{
  return cache.has(listener)
}

export const set=(listener, value)=>{
  cache.set(listener, value)
}


export const get=listener=>{
  return cache.get(listener)
}
