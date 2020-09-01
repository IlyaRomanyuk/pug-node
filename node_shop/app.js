const express = require('express');
let app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

let mysql = require('mysql2');

const nodemailer = require('nodemailer');

app.use(express.json());

var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'nodeshop',
    insecureAuth: true
});

app.listen(3030, function () {
    console.log('Server has been started');
})

app.get('/', function (request, response) {

    let cat = new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM category', function(error, result) {
            if(error) reject(error);
            resolve(result);
        })
    })

    let goods = new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM GOODS', function(error, result) {
            if(error) reject(error);
            resolve(result);
        })
    })

    Promise.all([cat, goods]).then((data) => {
        console.log(data[0]);
        response.render('index', {
            category: JSON.parse(JSON.stringify(data[0])),
            elements: JSON.parse(JSON.stringify(data[1]))
        })
    })
})

app.get('/cat', function (request, response) {
    let catId = request.query.id;

    let cat = new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM category WHERE id=' + catId, function (error, result) {
            if (error) reject(error);
            resolve(result);
        })
    })

    let goods = new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM goods WHERE category=' + catId, function (error, result) {
            if (error) reject(error);
            let goods = {};
            for (let i = 0; i < result.length; i++) {
                goods[result[i]['id']] = result[i];
            }
            resolve(goods);
        })
    })

    Promise.all([cat, goods]).then((result) => {
        response.render('cat', {
            category: JSON.parse(JSON.stringify(result[0])),
            elements: JSON.parse(JSON.stringify(result[1]))
        })
    })
})

app.get('/goods', function (request, response) {
    let elemntId = request.query.id;

    connection.query('SELECT * from goods WHERE id=' + elemntId, function (error, result) {
        if (error) throw error;

        response.render('goods', {
            goods: JSON.parse(JSON.stringify(result))
        })
    })
})

app.get('/get-categories', function (request, response) {
    connection.query('SELECT * FROM category', function (error, result) {
        if (error) throw error;
        response.json(result);
    })
})


app.get('/order', function (request, response) {
    response.render('order');
})

app.post('/get-info-product', function (request, response) {
    if (request.body.keys.length != 0) {
        let query = request.body.keys.join(',');
        connection.query('SELECT * FROM goods WHERE id IN (' + query + ')', function (error, result) {
            if (error) throw error;
            let goods = {};

            for (let i = 0; i < result.length; i++) {
                goods[result[i]['id']] = result[i];
            }

            response.json(goods);
        });
    } else {
        response.send('0');
    }

})

app.post('/order-data', function(request, response) {
    let query = Object.keys(request.body.cart);
    query = query.join(',');
    if(request.body.cart.length != 0) {
        connection.query('SELECT * FROM goods WHERE id IN (' + query + ')', function (error, result) {
            if(error) throw error;
            sendMailer(request.body, result).catch(console.log(error));
            response.send('1');
        })
    } else {
        response.send('0');
    }
})

async function sendMailer(data, result) {
    let res = '<h2>Order in Lite shop</h2>';
    let tottal = 0;
    for(let i = 0; i< result.length; i++) {
        res += `<p>${result[i]['name']} - ${data.cart[result[i]['id']]} - Price: ${result[i]['cost'] * data.cart[result[i]['id']]} uah</p>`;
        tottal += result[i]['cost'] * data.cart[result[i]['id']];
    }
    res += `<hr>Total: ${tottal}`
    res += `<hr>Phone: ${data.phoneNumber}`
    res += `<hr>Address: ${data.address}`
    res += `<hr>Email: ${data.email}`
    res += `<hr>Username: ${data.username}`

    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      let mailOption = {
          from: '<ilya-romanyuk-1999@mail.ru>',
          to: 'ilya-romanyuk-1999@mail.ru,'+data.email,
          subject: "Lite shop order",
          text: 'hello',
          html: res
      };

      let info = await transporter.sendMail(mailOption);
      console.log('MesSent: %s', info.messageId);
      console.log('PreviewSent: %s', nodemailer.getTestMessageUrl(info));
      return true;
}