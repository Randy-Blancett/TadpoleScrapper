"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
exports["default"] = axios_1["default"].create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-type": "application/json"
    }
});
