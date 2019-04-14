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
      default: 'cards.csv',
      validate: value => {
        if (value.length) {
          return true;
        }
        return 'Please provide the file location!';
      },
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
      default: 'pauper',
    },
    {
      type: 'list',
      name: 'FILTER',
      message: 'Do you want to show only legals, not legals or both?',
      default: 'both',
      choices: ['legal', 'not_legal', 'both'],
    },
  ];
  return inquirer.prompt(questions);
};

const isFormatLegal = async (file, header, format, filter) => {
  const isPauperLegal = async cards => {
    const cardPauperLegal = [];
    for (let i = 0; i < cards.length; i++) {
      const result = await Scry.Cards.byName(cards[i], true);
      if (filter === 'both') {
        cardPauperLegal.push({
          cardName: result.name,
          [`is${format.charAt(0).toUpperCase() + format.slice(1)}legal`]: result
            .legalities[format],
          colors: result.colors,
          image: result.image_uris.normal,
        });
      } else if (result.legalities[format] === filter) {
        cardPauperLegal.push({
          cardName: result.name,
          isLegal: result.legalities[format],
          colors: result.colors,
          image: result.image_uris.normal,
        });
      }
    }
    return cardPauperLegal;
  };
  const getCardsUniqName = async data => {
    let uniq = [];
    uniq = [...new Set(data)];
    console.log(await isPauperLegal(uniq));
  };
  const readCSV = file => {
    const cardsNames = [];
    Papa.parse(file, {
      header: true,
      step: result => {
        cardsNames.push(result.data[0][header]);
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
  isFormatLegal(file, HEADER, FORMAT, FILTER);
};

run();
