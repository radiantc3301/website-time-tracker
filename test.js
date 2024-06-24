const names = ['a','b','c','d']

const myForEach = (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i]
    cb(element)
  }
}

myForEach(names, (name) => {
  console.log(name)
})