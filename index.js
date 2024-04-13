const express = require('express')
const moment = require('moment');
const app = express()
const dotenv = require('dotenv')
const port = 3000
const bodyParser = require('body-parser');
var quizKeys= "";
const categories = ['Quiz', 'Test', 'PYQs'];

const username = "AdminTech"
const password = "AdminTech@321"
const admin = require('firebase-admin');
app.use(bodyParser.urlencoded({ extended: true }));
const serviceAccount = require('./serviceAccountKey.json');
const { default: firebase } = require('firebase/compat/app');



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ss-project-940fa-default-rtdb.firebaseio.com/'
});


var auth = admin.auth();
const db = admin.database();
const ref = db.ref('/');

ref.once('value', (snapshot) => {
  console.log('Connected to the Firebase Realtime Database.');
  quizKeys = Object.keys(snapshot.val().QUIZ);
  console.log(snapshot.val())
  console.log(quizKeys);
}).catch((error) => {
  console.error('Error connecting to the Firebase Realtime Database:', error);
});

app.get('/add-question', (req,res)=>{
  res.render('pages/index', {quizKeys:quizKeys})
})

app.post('/add-question', (req, res) => {
    const selectedQuiz = req.body.quiz;
    const selectedDate = req.body.selectedDate;
    const { question, answers, correctAnswer } = req.body;
   

    const currentDate = new Date();
    const formattedDate = moment(currentDate).format('YYYY-MM-DD');

    // Reference to Firebase database
    const db = admin.database();
    const questionsRef = db.ref('Quiz').child(selectedQuiz).child(selectedDate);
    
    // Add question data to database
    questionsRef.push({
        question: question,
        answers: answers,
        correctAnswer: correctAnswer
    })
    .then(() => {
        res.send('Question added successfully!');
    })
    .catch(error => {
        console.error('Error adding question:', error);
        res.status(500).send('Error adding question');
    });
});


app.post('/create-event', (req, res) => {
  const eventDate = req.body.event_date;
  const eventName = req.body.event_name;
  const detail = req.body.description;
  const category = req.body.category;

  // Reference to Firebase database
  const db = admin.database();
  const questionsRef = db.ref(category).child(eventName).child(eventDate);
  
  // Add question data to database
  questionsRef.push({
      
  })
  .then(() => {
      res.send('Event created successfully!');
     
  })
  .catch(error => {
      console.error('Error adding question:', error);
      res.status(500).send('Error adding question');
  });
});



app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const userCredential =  auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      res.send(`Login successful. User ID: ${user.uid}`);
  } catch (error) {
      res.status(401).send(`Login failed: ${error.message}`);
  }
});


app.get('/home', (req, res)=>{
  res.render('pages/home')
})


app.set('view engine', 'ejs')


app.get('/about', (req, res) => {
  res.render('pages/about')
})

app.get('/create-event', (req, res) => {
  res.render('pages/create-event', { categories: categories })
})
app.get('/login', (req, res) => {
  res.render('pages/login')
})


app.get('/', (req, res) => {
    res.render('pages/home')
})
app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})