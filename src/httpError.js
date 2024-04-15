const e404 = (req, res, next) => {
    res.status(404).json({status: 404, message: `Error 404 ${req.path} not found.`});
};

const e500 = (err, _req, res, _next) => {
    const ierr = typeof err == "string"
        ? err
        : err.message ?? JSON.stringify(err);
    const status = err.status ?? 500
    const data = err.data ?? [];
    const briefError = (ierr.split(":").pop() ?? "").trim();
    const isBrief = briefError.length > 0 && briefError.length < 36; 
    const message = isBrief ? ierr : `${ierr}:Internal Error.`;
// console.log("ERR STRINGIFY", JSON.stringify(err));
// console.log("ERR STATUS", err.status)
// console.log("ERR MESSAGE", err.message)
// console.log("ERR DATA", err.data)
// console.log("ERR", err)
    res.status(status).json({ status, message, data });
};

export default [e404, e500];