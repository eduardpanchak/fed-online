// let firstNumber= prompt ('Type first value')
// let secondNumber= prompt ('Type second value')
let firstNumber= Number(prompt ('Type first value'))
let secondNumber= Number(prompt ('Type second value'))

// Конкатенація рядків
// console.log(`+ operation = ${+firstNumber+ +secondNumber}`)
// console.log(`+ operation = ${parseInt(firstNumber) + parseInt(secondNumber)}`)
// console.log(`+ operation = ${parseFloat(firstNumber) + parseFloat(secondNumber)}`)
console.log(`+ operation = ${Number(firstNumber) + Number(secondNumber)}`)
console.log(`- operation = ${firstNumber-secondNumber}`)
console.log(`* operation = ${firstNumber*secondNumber}`)
console.log(`/ operation = ${firstNumber/secondNumber}`)