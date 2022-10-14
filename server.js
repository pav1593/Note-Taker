const express = require('express');
const path = require('path');
const { readFromFile, readAndAppend, writeToFile} = require('./helpers/fsUtils');
const uuid = require('./helpers/uuid');
const notes = require('./db/db.json');


const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, './public/notes.html'))
);


// GET Route for /api/notes page
app.get('/api/notes', (req, res) => 
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
);

// POST Route for /api/notes page
app.post('/api/notes', (req, res) => {
  
  const { title, text } = req.body;

  if (req.body) {

    const newNote = {
      title,
      text,
      id: uuid()
    };

    readAndAppend(newNote, './db/db.json');
    res.json(`Note added successfully`);
  } else {
    res.error('Error in adding note');
  }
});

// Bonus
// You haven’t learned how to handle DELETE requests, but this application offers that functionality on the front end. As a bonus, try to add the DELETE route to the application using the following guideline:

// DELETE /api/notes/:id should receive a query parameter that contains the id of a note to delete. To delete a note, you'll need to read all notes from the db.json file, remove the note with the given id property, and then rewrite the notes to the db.json file.

app.delete('/api/notes/:id', (req,res)=>{

  if (req.params.id) {
    console.info(`${req.method} note request received for ${req.params.id}`);
  
    for (let i = 0; i < notes.length; i++) {
      
      const {title,text,id} = notes[i];

      console.log(i,title,text,id);

      if (id === req.params.id) {
        console.log(`Removing note ${id}`);  

        const response = {
          status: 'deleted!',
          title,
          text,
          id
        };

        res.json(response);
        notes.splice(i,1);
        writeToFile('./db/db.json',notes);
        return;
      }

    }
       res.status(404).send('Note ID not found');
  } else {
    res.status(400).send('Note ID not provided');
  }
});

// GET wildcared route to homepage
app.get('/*', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
