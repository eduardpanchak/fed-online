let firstValue = 23;

// == Виконуємо порівняння значень і приведення типів
console.log(`==`);
console.log(`compare result 2 and 3 ${2==3}`); // true, тому що "23" приводиться до числа 23
console.log(`compare result 2 and 2 ${2==2}`);
console.log(`compare result 2 and '2' ${2=='2'}`);
console.log(`compare result string and string ${'Max'=='Bob'}`);
console.log(`compare result boolean and number ${true==1}`);

// === Виконуємо порівняння значень без приведення типів
console.log(`===`)
console.log(`compare result 2 and 3 ${2===3}`); // true, тому що "23" приводиться до числа 23
console.log(`compare result 2 and 2 ${2===2}`);
console.log(`compare result 2 and '2' ${2==='2'}`);
console.log(`compare result string and string ${'Max'==='Bob'}`);
console.log(`compare result boolean and number ${true===1}`);

// != Виконуємо порівняння значень і приведення типів
console.log(`!=`)
console.log(`compare result 2 and 3 ${2!=3}`); // true, тому що "23" приводиться до числа 23
console.log(`compare result 2 and 2 ${2!=2}`);
console.log(`compare result 2 and '2' ${2!='2'}`);
console.log(`compare result string and string ${'Max'!='Bob'}`);
console.log(`compare result boolean and number ${true!=1}`);

// !== Виконуємо порівняння значень без приведення типів
console.log(`!==`);
console.log(`compare result 2 and 3 ${2!==3}`); // true, тому що "23" приводиться до числа 23
console.log(`compare result 2 and 2 ${2!==2}`);
console.log(`compare result 2 and '2' ${2!=='2'}`);
console.log(`compare result string and string ${'Max'!=='Bob'}`);
console.log(`compare result boolean and number ${true!==1}`);

// >, <, >=, <= Виконуємо порівняння значень
console.log(`>`);
console.log(`2>3 ${2>3}`);
console.log(`string 2>3 ${2>3}`);

console.log(`<`);
console.log(`2<3 ${2<3}`);
console.log(`string 2<3 ${2<3}`);

console.log(`>=`);
console.log(`2>=3 ${2>=2}`);
console.log(`string 2>=3 ${2>=3}`);

console.log(`<=`);
console.log(`2<=3 ${2<=3}`);
console.log(`string 2<=3 ${2<=3}`);

// && Виконуємо логічне І
// true && false => false
// true && true => true
// false && true => false
// false && false => false

let userAge = 25;
let checkUserAge = userAge>18;
let userNickName = 'admin';
let checkAdmin = 'admin == userNickName';
let userPermition = checkAdmin && checkUserAge;

// || Виконуємо логічне АБО
// true || false => true
// true || true => true
// false || true => true
// false || false => false