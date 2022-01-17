const rand = (array) => Math.floor(Math.random() * array.length);

const generateOrder = (n) => {
  const status = ['paymentAcc', 'paymentRej'];
  let out =
    'INSERT INTO 3_pharmacy.order(totalPriceRp, checkedOutAt, status, user_id, profitRp) VALUES';
  for (let i = 0; i < status.length; i++) {
    for (let j = 0; j < n; j++) {
      out += `(${Math.random() * 1000}, NOW() - INTERVAL ${j} HOUR, '${
        status[rand(status)]
      }', 1, ${Math.random() * 1000})`;
      if (j !== n - 1 || i !== status.length - 1) out += ', ';
    }
  }
  out += ';';
  return out;
};

const generatePrescription = (n) => {
  const status = ['paymentAcc', 'paymentRej'];
  let out =
    'INSERT INTO 3_pharmacy.prescription(prescriptionName, image, expiredAt, totalPriceRp, profitRp, status, user_id) VALUES';
  for (let i = 0; i < status.length; i++) {
    for (let j = 0; j < n; j++) {
      out += `('name', 'img', NOW() - INTERVAL ${j} DAY, ${
        Math.random() * 1000
      }, ${Math.random() * 1000}, '${status[i]}', 1)`;
      if (j !== n - 1 || i !== status.length - 1) out += ', ';
    }
  }
  out += ';';
  return out;
};

console.log(generatePrescription(500));
console.log(generateOrder(300));
