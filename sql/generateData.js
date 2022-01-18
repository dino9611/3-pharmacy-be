const rand = (array) => array[Math.floor(Math.random() * array.length)];

const generateOrder = (n) => {
  const status = ['delivered', 'paymentRej'];
  let out =
    'INSERT INTO 3_pharmacy.order(totalPrice, checkedOutAt, status, user_id, profitRp) VALUES';
  for (let i = 0; i < status.length; i++) {
    for (let j = 0; j < n; j++) {
      out += `(${Math.random() * 1000}, NOW() - INTERVAL ${j} DAY, '${
        status[i]
      }', 2, ${Math.random() * 1000})`;
      if (j !== n - 1 || i !== status.length - 1) out += ', ';
    }
  }
  out += ';';
  return out;
};

const generatePrescription = (n) => {
  const status = ['delivered', 'rejected', 'expired'];
  let out =
    'INSERT INTO 3_pharmacy.prescription(prescriptionName, image, expiredAt, totalPriceRp, profitRp, status, user_id) VALUES';
  for (let i = 0; i < status.length; i++) {
    for (let j = 0; j < n; j++) {
      out += `('name', 'img', NOW() - INTERVAL ${j} DAY, ${
        Math.random() * 1000
      }, ${Math.random() * 1000}, '${status[i]}', 2)`;
      if (j !== n - 1 || i !== status.length - 1) out += ', ';
    }
  }
  out += ';';
  return out;
};

// console.log(generatePrescription(400));
// console.log(generateOrder(400));
