// Input/Output - введення/виведення даних
let firstNumber = 10;
// let promptResult = prompt('Напишіть щось')
// let promptResult = prompt('Напишіть щось', 'Test')
let promptResult = prompt('Напишіть щось', false)
console.log(promptResult);

// confirm - діалогове вікно з підтвердженням
let confirmValue = confirm('Вам є 18 років?')
console.log(confirmValue);

// alert - виведення інформації користувачу (вікно з повідомленням)
alert(promptResult);
alert(`result confirm = ${confirmValue}`);