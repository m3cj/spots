import express from "express";
import path from 'path'

const app = express()

// Set directory
app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname, 'public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

const port = process.env.PORT || 3000;

app.listen(port , ()=> {
    console.log('server is running')
})