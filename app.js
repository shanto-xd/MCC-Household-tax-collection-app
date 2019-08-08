const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('connect-flash');

// import routes
const formRoutes = require('./routes/form');
const authRoutes = require('./routes/auth');
// import controllers
// import db models
// configure db conncetion
// configure image file storages
// configure cookies and sessions
// configure authentication
// configure csrf token


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(formRoutes);
app.use(authRoutes);



app.listen(3000, () => {
    console.log('Server is running at 3000');
})