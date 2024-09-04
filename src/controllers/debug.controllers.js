const { StatusCodes } = require("http-status-codes");
const { getNumOfConns } = require("../helpers/check.connect");

class DebugController {
    static async checkConnection(req, res) {
        const numOfConnections = await getNumOfConns();
        const jsonBody = {
            "message": "ok",
            "numOfConns": numOfConnections,
        }
        if (numOfConnections >= 0) {
            return res.status(StatusCodes.OK).json(jsonBody);
        }
        jsonBody.numOfConns = null;
        res = res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        switch (numOfConnections) {
            case -1:
                jsonBody.message = "cannot reach database";
                break;
            case -2:
                jsonBody.message = "other type of error";
                break;
        }
        return res.json(jsonBody);
    }
}

module.exports = DebugController;