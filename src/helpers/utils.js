const checkPresenceObject = (obj, fields) => {
    // don't validate if the field is falsy value but by its presence
    // that is decided by the database
    const output = {};
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (!(field in obj)) {
            return null;
        }
        output[field] = obj[field];
    }
    return output;
}

module.exports = { checkPresenceObject };