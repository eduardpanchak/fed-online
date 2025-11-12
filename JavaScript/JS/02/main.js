let productPrice = 1.5;
// якщо потрібно вказати ціну продукту
let saleValue = 0.345;
// якщо потрібно вказати відсоток знижки

//NaN - not a number
// Infinity - нескінченність

//Boolean - true/false 
let isAdmin = true; 
let isUser = false; 
// якщо потрібно вказати чи є користувач адміністратором або користувачем

//String - рядок
let userName = "John";

// Null - відсутність значення
let emptyValue = null;
// якщо потрібно вказати відсутність значення

// Undefined - не визначено
let notDefinedValue;
// якщо потрібно вказати, що значення не визначено

// Object - об'єкт
let user = {
    name: "Alice",
    age: 30
};
// якщо потрібно зберегти інформацію про користувача

console.log("Hello from JS!");
console.log(userName);
console.log(productPrice);

console.log('Is user admin? ', isAdmin);

// let result = userName+''+productPrice;
let result = `Hello template literal ${userName} has saleValue $${saleValue} more info about user ${isUser} math operetion ${2 * 2}`;
console.log('Result: ', result);
