module.exports = {
  studentWelfare: {
    input: '../swagger.json',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/model',
      client: 'react-query',
    },
  },
};