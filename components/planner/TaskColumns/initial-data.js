const initialData = {
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      cardIds: ['taskcard-1', 'taskcard-2', 'taskcard-3'],
    },
    'column-2': {
      id: 'column-2',
      title: 'Doing',
      cardIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      cardIds: [],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
  taskCards: {
    'taskcard-1': {
      id: 'taskcard-1',
      title: 'Take out the garbage',
      category: 'Life',
      content: 'Bro, it has been filling up for a while. I mean, it stinks. Do your chores.',
      checked: false,
      subTasks: ['subtask-1', 'subtask-2'],
    },
    'taskcard-2': {
      id: 'taskcard-2',
      title: 'Eat food',
      category: 'Life',
      content: 'What more is there to say? Food is the one of the greatest things in life.',
      checked: true,
      subTasks: [],
    },
    'taskcard-3': {
      id: 'taskcard-3',
      title: 'Watch Harry Potter',
      category: 'Life',
      content: 'I know, you have watched it so many times already. But one more time. Do it. For Daddy Voldy.',
      checked: false,
      subTasks: ['subtask-3'],
    },
  },
  subTasks: {
    'subtask-1': {
      id: 'subtask-1',
      title: 'Find where the garbage can is',
      checked: false,
    },
    'subtask-2': {
      id: 'subtask-2',
      title: 'Actually get out of the house',
      checked: true,
    },
    'subtask-3': {
      id: 'subtask-3',
      title: 'Download the movie first',
      checked: true,
    },
  },
}

export default initialData
