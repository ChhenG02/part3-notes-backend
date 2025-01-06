const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));


// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
}));



let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" },
];

// Middleware to parse JSON bodies
app.use(express.json());

// RequstLogger Middleware
morgan.token('body', (req) => JSON.stringify(req.body)); 
app.use(
  morgan((tokens, req, res) => {
    const logMessage = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
    ].join(' ');

    // **Include request body for POST and PUT**
    if (req.method === 'POST' || req.method === 'PUT') {
      return `${logMessage} ${tokens.body(req, res)}`;
    }
    return logMessage;
  })
);

// GET persons
app.get('/api/persons', (req, res) => {
  res.json(persons);
});


// GET a single person by id
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id; 
  const person = persons.find(p => p.id === id);
  
  // checkout if person exists
  if (person) {
    res.json(person); 
  } else {
    res.status(404).send({ error: 'Person not found' }); 
  }
});

// DELETE a single person by id
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const initialLength = persons.length;
  persons = persons.filter(p => p.id !== id);

  if (persons.length < initialLength) {
    res.status(204).end(); 
  } else {
    res.status(404).send({ error: 'Person not found' }); 
  }
});

// Post a new person
app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;

  // Check if name or number is missing
  if (!name || !number) {
    return res.status(400).send({ error: 'Name or number missing' });
  }

   // Check if the name already exists in the phonebook
   if (persons.some(person => person.name === name)) {
    return res.status(400).send({ error: 'name must be unique' });
  }

  // Generate a random id
  const id = Math.floor(Math.random() * 1000000).toString(); 

  const newPerson = { id, name, number };
  persons.push(newPerson);

  res.status(201).json(newPerson);
});

// GET info
app.get('/info', (req, res) => {
  const currentTime = new Date();
  const info = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${currentTime}</p>
  `;
  res.send(info);
});

// Middleware for 404 Errors
app.use((req, res) => res.status(404).send({ error: 'unknown endpoint' })); 


// Middleware for handling frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 