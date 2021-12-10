const jwt = require("jsonwebtoken")



module.exports = {
<<<<<<< HEAD
    verifyEmailToken : (req,res, next) => {
        // const {token} = req.body
        const token = req.token
=======
    verifyEmailToken: (req, res, next) => {
        // const token = req.token
        const { token } = req.body
>>>>>>> develop-be
        const key = process.env.JWT_KEY
        jwt.verify(token, key, (err, decoded) => {
            if (err) {
                console.log(err)
<<<<<<< HEAD
                return res.status(401).send({message: "User Unauthorized"})
=======
                return res.status(401).send({ message: "user unauthorized" })
>>>>>>> develop-be
            }
            console.log(decoded)
            req.user = decoded
            next();
        })
    },
    verifyAccessToken: (req, res, next) => {
        const token = req.token
        const key = process.env.JWT_KEY
        jwt.verify(token, key, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "user unauthorized" })
            }
            req.user = decoded
            next()
        })
    }
}