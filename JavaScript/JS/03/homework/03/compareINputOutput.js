let userAge = prompt('Введіть ваш вік');
userAge = Number(userAge);

let checkUserAge = userAge > 18;
alert(`Ви ${checkUserAge ? 'можете' : 'не можете'} відвідувати цей сайт  (вам ${userAge} років)`);