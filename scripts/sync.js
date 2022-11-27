const User = require('../models/user');
const medical = require('../models/medical');
const questionnaire = require('../models/questionnaire');

async function sync () {
    await User.sync();
    await questionnaire.sync();
    await medical.sync();
}

sync()
    .catch(console.error)
    .finally(() => process.exit(0));