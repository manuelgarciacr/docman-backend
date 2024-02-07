import tcpPortUsed from "tcp-port-used";

/**
 * Normalize a port into a number, string, or false.
 */

export async function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        return tcpPortUsed.check(port).then(
            function (inUse) {
                if (inUse) {
                    console.log("Port %s usage: %s", port, inUse);
                    return 0;
                }
                return port;
            },
            function (err) {
                console.error("Error on check:", err.message);
                return 0;
            }
        );
    }

    return false;
}
