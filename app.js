#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('Is My Card Legal?', {
        font: 'big',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
};

const askQuestions = () => {
  const questions = [
    {
      name: 'FILENAME',
      type: 'input',
      message: 'What is the path with the name of the file? i.e. ../cards.csv',
    },
    {
      type: 'input',
      name: 'HEADER',
      message: 'What is the header with the cards names?',
      default: 'Name',
    },
    {
      type: 'list',
      name: 'FORMAT',
      message: 'What is the format you want to filter?',
      choices: [
        'standard',
        'future',
        'frontier',
        'modern',
        'legacy',
        'pauper',
        'vintage',
        'penny',
        'commander',
        'duel',
        'oldschool',
      ],
    },
    {
      type: 'list',
      name: 'FILTER',
      message: 'Do you want to show only legals, not legals or both?',
      choices: ['legal', 'not_legal', 'both'],
      default: 'both',
    },
  ];
  return inquirer.prompt(questions);
};

const run = async () => {
  // show script introduction
  init();
  // ask questions
  const answers = await askQuestions();
  const { FILENAME, HEADER, FORMAT, FILTER } = answers;
  // run the legalities validator

  // show success message
};

run();
