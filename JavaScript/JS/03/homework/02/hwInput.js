let firstValue = prompt('Введіть число');
let numberValue = firstValue%2===0;

console.log(numberValue ? `Число ${firstValue} парне` : `Число ${firstValue} непарне`);
alert(`Результат проівняння числа: ${numberValue ? 'парне' : 'непарне' }`);