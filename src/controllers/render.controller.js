const renderCtrl = {}

renderCtrl.renderDocument = (req, res) => {
    res.render('viewer')
}

//module.exports = indexCtrl;
export { renderCtrl };
