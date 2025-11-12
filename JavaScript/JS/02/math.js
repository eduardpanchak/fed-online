//Віднімання -
//Множення *
//Ділення /
//Додавання +
//Залишок від ділення %
//Піднесення до степеня **

let firstValue = 2;
let secondValue = 3;

console.log(`- operation ${firstValue-secondValue}`); //Віднімання
console.log(`* operation ${firstValue*secondValue}`); //Множення
console.log(`/ operation ${firstValue/secondValue}`); //Ділення
console.log(`+ operation ${firstValue+secondValue}`); //Додавання
console.log(`% operation ${firstValue%secondValue}`); //Залишок від ділення
console.log(`** operation ${firstValue**secondValue}`); //Піднесення до степеня

//Залишок від ділення %
console.log(`% operation 3/3 ${secondValue%3}`);
console.log(`% operation 3/1 ${secondValue%1}`);
console.log(`% operation 3/2 ${secondValue%2}`);
console.log(`% operation 30/10 ${30%10}`);

//Піднесення до степеня **
console.log(`** operation 2->2 ${2**2}`);
console.log(`** operation 2->3 ${2**3}`);
console.log(`** operation 8->2 ${8**2}`);

//Корені
console.log(`** operation 4->0.5 ${4**0.5}`); //Квадратний корінь з 4
console.log(`** operation 9->0.5 ${9**0.5}`); //Квадратний корінь з 9
console.log(`** operation 27->(1/3) ${27**(1/3)}`); //Кубічний корінь з 27

//Пріоритет операцій
console.log(`operation priority 2+3*4=${2+3*4}`); //12
console.log(`operation priority (2+3)*4=${(2+3)*4}`); //20

let result1 = (5 + 3) * 2 - 7;
let result2 = (10 / 2) ** 2;
let result3 = 2 * (4 + 3) - (8 / 2);
let result4 = (15 % 4) + 5;
let result5 = 3 - (2 ** 4);

console.log("Operation 1:", result1);
console.log("Operation 2:", result2);
console.log("Operation 3:", result3);
console.log("Operation 4:", result4);
console.log("Operation 5:", result5);