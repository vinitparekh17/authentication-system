const jwt = require("jsonwebtoken");
//model is

const auth = (req, res, next) => {
    //finding the token
    const token = req.cookies.token || req.header('Authorization').replace('Bearer ', '')
    if (!token) {
        return res.status(403).send("Token does not found!")
    }

    // token found then decoding whateven the payload is there in the token
    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        // console.log(decode);
    } catch (e) {
        console.log(e);
    }
    return next()
}

module.exports = auth