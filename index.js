const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Publications';

app.get('/', (req, res) => {
  res.send('Hello, publications');
})

app.get('/api/v1/papers', (req, res) => {
  database('papers').select()
    .then((papers) => {
      res.status(200).json(papers);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.get('/api/v1/footnotes', (req, res) => {
  database('footnotes').select()
    .then((footnotes) => {
      res.status(200).json(footnotes);
    })
    .catch((error) => {
      res.status(500).json({ error })
    });
})

app.post('/api/v1/papers', (req, res) => {
  const paper = req.body;

  for (let requiredParameter of ['title', 'author', 'publisher']) {
    if (!paper[requiredParameter]) {
      return res.status(422)
                .send({ error: `Expected format: { title: <String>, author: <String>, publisher: <String> }. You're missing a ${requiredParameter} property.` });
    }
  }

  database('papers').insert(paper, 'id')
    .then(paper => {
      res.status(201).json({ id: paper[0] })
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});

app.post('/api/v1/footnotes', (req, res) => {
  const footnote = req.body;

  for (let requiredParameter of ['note', 'paper_id']) {
    if (!footnote[requiredParameter]) {
      return res.status(422)
                .send({ error: `Expected format: { note: <String>, paper_id: <Integer>. You're missing a ${requiredParameter} property.}` });
    }
  }

  database('footnotes').insert(footnote, 'id')
    .then(footnote => {
      res.status(201).json({ id: footnote[0] })
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});

// Retrieve a single record
app.get('/api/v1/papers/:id', (req, res) => {
  database('papers').where('id', req.params.id).select()
    .then(papers => {
      if (papers.length) {
        res.status(200).json(papers);
      } else {
        res.status(404).json({
          error: `Could not find paper with id ${req.params.id}`
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});

// Retrieve a single footnote
app.get('/api/v1/footnotes/:id', (req, res) => {
  database('footnotes').where('id', req.params.id).select()
    .then(footnotes => {
      if (footnotes.length) {
        res.status(200).json(footnotes);
      } else {
        res.status(404).json({
          error: `Could not find footnote with id ${req.params.id}`
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});
