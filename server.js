const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
    const formData = req.body;
    const recaptchaToken = req.body['g-recaptcha-response'];
    const secretKey = '6Lf89d0pAAAAAF16gFt7sITg4nP8gclZkmDP30fM'; 

  
    axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`)
        .then(response => {
            if (response.data.success) {
                fs.readFile('db.json', 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Ошибка при чтении файла базы данных.');
                    }

                    let database = JSON.parse(data);

                    database.push(formData);

                    fs.writeFile('db.json', JSON.stringify(database, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Ошибка при записи в файл базы данных.');
                        }
                        res.redirect('index.html');
                    });
                });
            } else {
                res.status(400).send('Ошибка: Неправильная проверка reCAPTCHA');
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Ошибка при проверке reCAPTCHA');
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
