const userCtrl = {};

userCtrl.signup = (req, res) => {
    res.send("signup");
};

userCtrl.signin = (req, res) => {
    res.send("signin");
};

userCtrl.logout = (req, res) => {
    res.send("logout");
}

export { userCtrl };
