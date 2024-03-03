const ownerSignupSchema = {
    "user.firstName": {
        trim: true,
        notEmpty: {
            errorMessage: "The first name is mandatory.",
        },
        escape: true,
    },
    "user.lastName": {
        trim: true,
        notEmpty: {
            errorMessage: "The last name is mandatory.",
        },
        escape: true,
    },
    "user.email": {
        trim: true,
        notEmpty: {
            bail: true,
            errorMessage: "The email is mandatory.",
        },
        isEmail: {
            bail: true,
            errorMessage: "The email is not valid.",
        },
        normalizeEmail: true,
    },
    "user.password": {
        isLength: {
            bail: true,
            options: { min: 8 },
            errorMessage: "The password must be at lest 8 characters",
        },
        matches: {
            options:
                /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])(?!.* ).{8,}$/,
            errorMessage:
                "The password must have at least one lowercase letter, one uppercase letter, one digit, and one special character.",
        },
    },
    "user.enabled": {
        isFalse: {
            custom: v => v === false,
            errorMessage: "User enabled is not false.",
        },
    },
    "collection.name": {
        isLength: {
            bail: true,
            options: { min: 3 },
            errorMessage: "The collection must be at lest 3 characters.",
        },
        escape: true,
    },
    "collection.description": {
        exists: {
            errorMessage: "The collection must exists",
        },
        escape: true,
    },
    "collection.users": {
        isArray: {
            bail: true,
            errorMessage: "Collection users is not an array.",
        },
        isEmptyArray: {
            custom: v => v.length == 0,
            errorMessage: "Collection users is not an empty array.",
        },
    },
    "collection.roles": {
        isArray: {
            bail: true,
            errorMessage: "Collection roles is not an array.",
        },
        isEmptyArray: {
            custom: v => v.length == 0,
            errorMessage: "Collection roles is not an empty array.",
        },
    },
    "collection.documents": {
        isArray: {
            bail: true,
            errorMessage: "Collection documents is not an array.",
        },
        isEmptyArray: {
            custom: v => v.length == 0,
            errorMessage: "Collection documents is not an empty array.",
        },
    },
    "stayLoggedIn": {
        isBoolean: {
            custom: v => v === true || v === false,
            errorMessage: "Stay logged is not boolean.",
        },
    },
};

export {ownerSignupSchema}