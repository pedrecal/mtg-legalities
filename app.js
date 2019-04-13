#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
const Scry = require('scryfall-sdk');
const Papa = require('papaparse');
const fs = require('fs');

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

const isFormatLegal = async (file, header, format, filter) => {
  const isPauperLegal = async cards => {
    const cardPauperLegal = [];
    for (let i = 0; i < cards.length; i++) {
      const result = await Scry.Cards.byName(cards[i], true);
      if (result.legalities[format] === 'legal') {
        cardPauperLegal.push({
          cardName: result.name,
          isPauperLegal: result.legalities.pauper,
          colors: result.colors,
        });
      }
    }
    return cardPauperLegal;
  };
  const getCardsUniqName = async data => {
    const namesArray = [];
    let uniq = [];
    for (let i = 1; i < data.length; i++) {
      namesArray.push(data[i][0][0]);
    }
    uniq = [...new Set(namesArray)];
    console.log(await isPauperLegal(uniq));
  };
  const readCSV = file => {
    const cardsNames = [];
    Papa.parse(file, {
      step: result => {
        cardsNames.push(result.data);
      },
      complete: results => {
        const cards = getCardsUniqName(cardsNames);
      },
    });
  };

  readCSV(file);
};

const run = async () => {
  // show script introduction
  init();
  // ask questions
  const answers = await askQuestions();
  const { FILENAME, HEADER, FORMAT, FILTER } = answers;
  // run the legalities validator
  const file = fs.createReadStream(FILENAME);
  isFormatLegal(file, 'Name', FORMAT, 'both');
  // show success message
};

run();
