const User = require('../models/user');

async function sync () {
    await User.sync();
}

sync()
    .catch(console.error)
    .finally(() => process.exit(0));