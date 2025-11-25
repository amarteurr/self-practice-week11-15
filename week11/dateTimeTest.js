//Create Date Object
//1. no parameters, display current date and time
const today = new Date()
console.log(today)//2025-11-18T07:00:46.151Z
console.log(today.getTime())


//2. input parameters - milisecond
const now = Date.now()
console.log(now)//1763449282400
const now2 =Date(now)
console.log(now2)

//3. input parameters - date string
const starDate = new Date ('2025-11-18T10:30:00z')
console.log(starDate)//2025-11-18T10:30:00.000Z
const localDate = new Date("2025-11-18T10:30:00")
console.log(localDate)//2025-11-18T03:30:00.000Z
//4. input parameter - date/time parameter
const myDate = new Date(2025, 12, 10, 30, 15, 25) // year, month, day, hh, mm, ss
console.log(myDate) //2026-01-10T23:15:25.000Z

//compare date time
const startBooking = new Date("2025-11-15T12:00:00")
const stopBooking = new Date("2025-11-16T12:00:00")
 
const bookingtime = new Date("2025-11-16T12:00:00")
if (bookingtime >= startBooking && bookingtime <= stopBooking)
  console.log("valid booking time")
else console.log("invalid booking time")
 
// console.log(startBooking.getTime()) //get millisecond
// console.log(stopBooking.getTime()) //get millisecond
 
// console.log(startBooking === stopBooking) //false forever, compare reference
// console.log(startBooking.getTime() === stopBooking.getTime()) //false forever, compare reference
 
// //compare >, <, <=, >= date objects
// console.log(startBooking > stopBooking) //false
// console.log(startBooking < stopBooking) //true
 
