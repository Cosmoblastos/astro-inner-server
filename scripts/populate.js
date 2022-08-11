const UserModel = require('../models/user');

async function main () {
    await UserModel.User.bulkCreate([
        {
            id: 'guest',
            firstName: 'Guest',
            lastName: '',
            color: null
        },
        {
            id: 'blablabla',
            firstName: 'Alejandro',
            lastName: 'Gómez García',
            color: 'black'
        },
    ]);
}

main()
    .then(() => {
        console.log('process finished');
    })
    .finally(() => {
        process.exit(0);
    })