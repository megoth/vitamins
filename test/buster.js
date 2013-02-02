var config = module.exports;

config["Graphite tests - browser"] = {
    environment: "browser",
    rootPath: "../",
    sources: [
        "src/*.js"
    ],
    tests: [
        "test/*.test.js"
    ],
    libs: [
        "lib/*.js"
    ],
    extensions: [
        require("buster-lint")
    ],
    "buster-lint": {
        excludes: [
            "d3",
            "jquery",
            "underscore"
        ],
        linterOptions: {
            maxlen: 200,
            nomen: true
        }
    }
};
