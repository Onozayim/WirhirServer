const { RandomNames } = require("../Models/RandomNames");

const createRandomName = async (lenguage) => {
  let elements;
  let colors;

  if (lenguage === "español") {
    elements = [
      "Perro",
      "Gato",
      "Hamster",
      "Oso",
      "Leon",
      "Tigre",
      "Jaguar",
      "Pantera",
      "Zebra",
      "Jirafa",
    ];

    colors = [
      "Rojo",
      "Azul",
      "Verde",
      "Naranja",
      "Amarillo",
      "Rosa",
      "Blanco",
      "Negro",
    ];
  } else {
    elements = [
      "Dog",
      "Cat",
      "Hamster",
      "Bear",
      "Lion",
      "Tiger",
      "Jaguar",
      "Panther",
      "Zebra",
      "Giraffe",
    ];

    colors = [
      "Red",
      "Blue",
      "Green",
      "Orange",
      "Yellow",
      "Pink",
      "White",
      "Black",
    ];
  }

  const randomNames = await RandomNames.find();

  let flag = true;
  let name;

  const date = new Date();

  const month = date.getUTCMonth();
  const day = date.getDate();
  const hour = date.getHours();

  const complement = month + day + hour + "";

  console.log(complement);

  do {
    if (lenguage === "español") {
      name = `${elements[Math.floor(Math.random() * elements.length)]}_${
        colors[Math.floor(Math.random() * colors.length)]
      }_${Math.floor(Math.random() * 100000).toString()}_${complement}`;
    } else {
      name = `${colors[Math.floor(Math.random() * colors.length)]}_${
        elements[Math.floor(Math.random() * elements.length)]
      }_${Math.floor(Math.random() * 100000).toString()}_${complement}`;
    }

    randomNames.name?.map((item) => {
      if (item.name === name) flag = false;
    });
  } while (!flag);

  console.log(name);
  return name;
};

module.exports = { createRandomName };
