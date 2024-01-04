const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');    
const ejs=require('ejs');

const app = express();
const port = 3000;

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
}).single('image');


// mysql database connection
const db=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'hal987@@@',
  database:'image_upload_db'
});

db.connect((err)=>{
  if(err){
    console.error('database connection failed:' + db.stack);
    return;
  }
  else{
    console.log('connected to database as id' + db.threadId);
  }
})









// Express middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Serve static files from the public directory
app.use(express.static('public'));

// Serve uploaded images from the uploads directory
app.use('/uploads', express.static('uploads'));

// Set up EJS view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/gallery', (req, res) => {
  res.render('gallery');
});


app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('index', { msg: err });
    } else {
      if (req.file == undefined) {
        res.render('index', { msg: 'Error: No File Selected!' });
      } else {
        const imagePath = '/uploads/' + req.file.filename;


        
        // Insert the full image path into the database
        const insertQuery = 'INSERT INTO images (path) VALUES (?)';
        db.query(insertQuery, [imagePath], (err, result) => {
          if (err) throw err;
          res.render('index', { msg: 'Image uploaded successfully!' });
        });
      }
    }
  });
});

// Route to retrieve images from the database
app.get('/images', (req, res) => {
  const selectQuery = 'SELECT * FROM images';
  db.query(selectQuery, (err, results) => {
    if (err) {
      res.json({ error: 'Error: Failed to fetch images from the database!' });
    } else {
      res.json(results);     
    }
  });
});









app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});