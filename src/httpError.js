export default (err, _req, res, _next) => {
    // const desc = err?.toString().split("\n")[0];
    // const error = err.error;
    // const path = err.path;
    // const reason = err.reason?.toString().split("\n")[0];

    // const status = err.statusCode || 500;
    // const msg = [];
    // const data = [];
console.log("httpError", err)
    // if (desc) msg.push(`desc: ${desc}`);
    // if (error) msg.push(`error: ${error}`);
    // if (path) msg.push(`path: ${path}`);
    // if (reason) msg.push(`reason: ${reason}`);
    // const message = msg.join(". ") + ".";
    const ierr = `Internal Error. ${JSON.stringify(err)}`;
    const status = err.status ?? 500
    const message = err.message ?? (ierr.length > 35 ? 'Internal Error.' : ierr);
    const data = err.data ?? []

    res.status(status).json({ status, message, data });
};
