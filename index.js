const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
const Product = require('./models/Producttt');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

require('dotenv').config();


// الاتصال بقاعدة بيانات MongoDB باستخدام الرابط من .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));
// Routes
app.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('index', { products });
});

app.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product.additionalImages) product.additionalImages = [];
    res.render('product', { product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/admin', async (req, res) => {
  const products = await Product.find();
  res.render('admin', { products });
});

// Add Product
app.post('/admin/add', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
    await Product.create({ name, price, description, image: imagePath });
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding product');
  }
});

// Edit Product
app.post('/admin/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, existingImage } = req.body;

    let imagePath = existingImage;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(id, {
      name,
      price,
      description,
      image: imagePath
    });

    res.redirect('/adingadmin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating product');
  }
});

// Delete Product
app.post('/admin/delete/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting product');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});