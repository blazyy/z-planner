const initialData = {
  cards: {
    'card-1': {
      id: 'card-1',
      title: 'Take out the garbage',
      category: 'Life',
      content: 'Bro, it has been filling up for a while. I mean, it stinks. Do your chores.',
      checked: false,
    },
    'card-2': {
      id: 'card-2',
      title: 'Eat food',
      category: 'Life',
      content: 'What more is there to say? Food is the one of the greatest things in life.',
      checked: true,
    },
    'card-3': {
      id: 'card-3',
      title: 'Watch Harry Potter',
      category: 'Life',
      content: 'I know, you have watched it so many times already. But one more time. Do it. For Daddy Voldy.',
      checked: false,
    },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      cardIds: ['card-1', 'card-2', 'card-3'],
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
}

export default initialData
