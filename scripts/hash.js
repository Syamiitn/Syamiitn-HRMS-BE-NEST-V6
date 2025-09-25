const bcrypt = require('bcrypt');

const password = process.argv[2] || 'Password@123';
const rounds = parseInt(process.argv[3] || '10', 10);

bcrypt
  .hash(password, rounds)
  .then((h) => {
    console.log(h);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

