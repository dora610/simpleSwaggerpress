const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/images/');
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split('.')[1];
    const date = new Date();

    const uniqueFileName = `${date.getFullYear()}${date.getMonth()}${date.getDate()}_${uuidv4()}.${fileExtension}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024000 },
}).single('uploaded_file');

function fileFilter(req, file, next) {
  if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
    next(null, true);
    return;
  } else {
    next({ error: 'File type cannot be accepted' }, false);
    return;
  }
  // You can always pass an error if something goes wrong:
  next(new Error('filter file error'));
}

const PORT = 5000;

let courses = [
  {
    id: '11',
    name: 'React Js',
    price: 299,
  },
  {
    id: '22',
    name: 'Node Js',
    price: 499,
  },
  {
    id: '33',
    name: 'aws',
    price: 999,
  },
];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send('It works');
});

app.get('/api/v1/greet', (req, res) => {
  res.status(200).send('Welcome to lco swagger tuts');
});

app.get('/api/v1/course/:courseId', (req, res) => {
  const courseSelected = courses.filter(({ id }) => id === req.params.courseId);
  if (courseSelected.length) {
    res.status(200).json(courseSelected[0]);
  } else {
    res.status(400).json({ error: 'Course not found' });
  }
});

app.get('/api/v1/courses', (req, res) => {
  console.log(req.headers);
  res.status(200).json(courses);
});

app.post('/api/v1/course', (req, res) => {
  courses.push(req.body);
  res
    .status(200)
    .json({ success: `Successfully created ${courses.at(-1)['name']} course` });
});

app.get('/api/v1/searchcourse', (req, res) => {
  const { location, device } = req.query;
  if (location && device) {
    res.status(200).json({ location, device });
  } else {
    res.status(400).json({ error: 'Course not found' });
  }
});

const uploadFileHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error(`Multer error ${err}`);
      res.status(400).json({ err });
      return;
    } else if (err) {
      console.error(`Other error ${err}`);
      res.status(400).json({ err });
      return;
    }
    next();
  });
};

app.post('/api/v1/uploadfile', uploadFileHandler, (req, res) => {
  if (req.file) {
    const { originalname, encoding, mimetype, size, destination, filename } =
      req.file;
    res.status(200).json({
      originalname,
      encoding,
      mimetype,
      size,
      destination,
      filename,
    });
  } else {
    res.status(400).json({ error: 'File could not be uploaded' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is up and running at http://127.0.0.1:${PORT}`);
});
