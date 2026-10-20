const bcrypt = require("bcrypt");

async function generateHash() {
    const password = "admin123";
    const hash = await bcrypt.hash(password, 12);

    console.log("Hashed Password:");
    console.log(hash);
}

generateHash();