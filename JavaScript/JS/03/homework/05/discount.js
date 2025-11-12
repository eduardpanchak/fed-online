let priceValue = prompt('Введіть ціну товару');
let discountValue = 50; // Відсоток знижки
let discountPrice = (priceValue * discountValue) / 100;
let finalPrice = priceValue - discountPrice;

console.log(`Ціна товару зі знижкою ${discountValue}% становить ${finalPrice}`);
alert(`Ціна товару зі знижкою ${discountValue}% становить ${finalPrice}`);