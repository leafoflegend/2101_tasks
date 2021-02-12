const path = require('path');
const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');

const app = express();
const db = new Sequelize('postgres://localhost:5432/2101_tasks', {
  logging: false,
});

const PORT = process.env.PORT || 3000;

// Interpret JSON
app.use(express.json());
// Log request urls
app.use((req, res, next) => {
  console.log('Request made to: ', req.path);

  if (Object.keys(req.body).length) console.log('Request body: ', req.body);

  next();
});
// Serve all files in the static directory
app.use(express.static(path.join(__dirname, './static')));

class Task extends Model {}
Task.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  complete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, { sequelize: db, modelName: 'tasks' });

app.get('/tasks', async (req, res) => {
  const tasks = await Task.findAll();

  res.send({
    tasks,
  });
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { complete } = req.body;

  const taskToUpdate = await Task.findByPk(id);

  if (!taskToUpdate) res.sendStatus(404);
  else {
    taskToUpdate.complete = complete;
    await taskToUpdate.save();

    res.sendStatus(200);
  }
});

app.post('/tasks', async (req, res) => {
  const { name } = req.body;

  const createdTask = await Task.create({
    name,
  });

  res.send({
    task: createdTask,
  });
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  const taskToDelete = await Task.findByPk(id);

  if (!taskToDelete) res.sendStatus(404);
  else {
    await taskToDelete.destroy();

    res.sendStatus(200);
  }
});

const startApp = async () => {
  const sync = !!process.env.SYNC;

  console.log(`Connecting to DB. Sync: ${sync}`);

  await db.sync({ force: sync });

  app.listen(PORT, () => console.log(`Server listening on PORT:${PORT}`));
}

startApp();
