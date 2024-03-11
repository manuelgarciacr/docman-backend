const e404 = (req, res, next) => {
    res.status(404).json({status: 404, message: `Error 404 ${req.path} not found.`});
};

const e500 = (err, _req, res, _next) => {
    const ierr = `Internal Error. ${JSON.stringify(err)}`;
    const status = err.status ?? 500
    const message = err.message ?? (ierr.length > 35 ? 'Internal Error.' : ierr);
    const data = err.data ?? []

    res.status(status).json({ status, message, data });
};

export default [e404, e500];