//synchronous programming
// console.log("starting...")
// console.log("working#1...")
// console.log("ending...")
//asynchronous programming
//console.log("starting...")
//setTimeout(() => console.log("working#2..."), 5000)
//setTimeout asynchoronous function
//console.log("ending...")


function doSomething(hasResource) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (hasResource ? resolve("done") : reject("fail")), 5000)
  })
}
// console.log("starting...")
// const workStatus = doSomething(true)
// console.log(workStatus)
// console.log("ending...")
//starting...
// Promise { <pending> }
// ending...
//fail, throw exception

//handle promise -2 ways (1) .then().catch()
//1) .then().catch()
// console.log('starting...')
// doSomething(false)
//     .then((result)=>{
//         console.log("working...")
//         console.log(`work status= ${result}`)
//         console.log("ending...")
//     })
//     .catch((error)=>{
//         console.log(error)
//     })

//2. async-await
async function working2(){
    console.log('starting...')
    try{
         const workStatus = await doSomething(false)
        console.log(workStatus)
        console.log("ending...")
    } catch (error) {
        console.log(error)
    }
}
working2()