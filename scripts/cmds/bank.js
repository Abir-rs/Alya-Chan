const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit or withdraw money from the bank and earn interest",
    guide: {
      vi: "",
      en: "{pn}Bank:\nInterest - Balance\n - Withdraw \n- Deposit \n- Transfer \n- Top"
    },
    category: "💰 Economy",
    countDown: 5,
    role: 0,
    author: "Loufi | SiAM | Samuel\n\nModified: Abir"
  },
  onStart: async function ({ args, message, event, api, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const info = await api.getUserInfo(user);
    const username = info[user].name;

 const bankDataPath = 'scripts/cmds/bankData.json';

if (!fs.existsSync(bankDataPath)) {
  const initialBankData = {};
  fs.writeFileSync(bankDataPath, JSON.stringify(initialBankData), "utf8");
}

const bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));

if (!bankData[user]) {
  bankData[user] = { bank: 0, lastInterestClaimed: Date.now() };
  fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
}


  bankBalance = bankData[user].bank || 0;

  const command = args[0]?.toLowerCase();
  const amount = parseInt(args[1]);
  const recipientUID = parseInt(args[2]);

    switch (command) {
case "deposit":
case    "-d":
  if (isNaN(amount) || amount <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❏Please enter a valid amount to deposit 🔁•");
  }


  if (bankBalance >= 1e104) {
    return message.reply("[🏦 Bank 🏦]\n\n❏You cannot deposit money when your bank balance is already at $1e104 ✖️•");
  }

  if (userMoney < amount) {
    return message.reply("[🏦 Bank 🏦]\n\n❏You don't have the required amount to deposit ✖️•");
  }

  bankData[user].bank += amount;
  await usersData.set(event.senderID, {
    money: userMoney - amount
  });
fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

  return message.reply(`[🏦 Bank 🏦]\n\n❏Successfully deposited $${amount} into your bank account ✅•`);
break;


case "withdraw":
 case     "-w":
  const balance = bankData[user].bank || 0;

  if (isNaN(amount) || amount <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❏Please enter the correct amount to withdraw 😪•");
  }

  if (userMoney >= 1e104) {
    return message.reply("[🏦 Bank 🏦]\n\n❏You cannot withdraw money when your balance is already at 1e104 😒•");
  }

  if (amount > balance) {
    return message.reply("[🏦 Bank 🏦]\n\n❏The requested amount is greater than the available balance in your bank account 🗿•");
  }

  // Continue with the withdrawal if the userMoney is not at 1e104
  bankData[user].bank = balance - amount;
  await usersData.set(event.senderID, {
    money: userMoney + amount
  });
fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
  return message.reply(`[🏦 Bank 🏦]\n\n❏Successfully withdrew $${amount} from your bank account ✅•`);
  break;


case "balance":
case    "bal":
  const formattedBankBalance = parseFloat(bankBalance);
  if (!isNaN(formattedBankBalance)) {
    return message.reply(`[🏦 Bank 🏦]\n\n❏Your bank balance is: $${formatNumberWithFullForm(formattedBankBalance)}`);
  } else {
    return message.reply("[🏦 Bank 🏦]\n\n❏Error: Your bank balance is not a valid number 🥲•");
  }
  break;



case "interest":
case "i":
  const interestRate = 0.001; // 0.1% daily interest rate
  const lastInterestClaimed = bankData[user].lastInterestClaimed || 0;

  const currentTime = Date.now();
  const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;

  if (timeDiffInSeconds < 86400) {
    // If it's been less than 24 hours since the last interest claim
    const remainingTime = Math.ceil(86400 - timeDiffInSeconds);
    const remainingHours = Math.floor(remainingTime / 3600);
    const remainingMinutes = Math.floor((remainingTime % 3600) / 60);

    return message.reply(`[🏦 Bank 🏦]\n\n❏You can claim interest again in ${remainingHours} hours and ${remainingMinutes} minutes 😉•`);
  }

  const interestEarned = bankData[user].bank * (interestRate / 970) * timeDiffInSeconds;

  if (bankData[user].bank <= 0) {
        return message.reply("[🏦 Bank 🏦]\n\n❏You don't have any money in your bank account to earn interest 💸🥱•");
  }

  bankData[user].lastInterestClaimed = currentTime;
  bankData[user].bank += interestEarned;

fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");


return message.reply(`[🏦 Bank 🏦]\n\n❏You have earned interest of $${formatNumberWithFullForm(interestEarned)}\n\nIt has been successfully added to your account balance ✅•`);
break;


case "transfer":
case "-t":
  if (isNaN(amount) || amount <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❏Please enter a valid amount to transfer 🔁•");
  }

  if (!recipientUID || !bankData[recipientUID]) {
    return message.reply("[🏦 Bank 🏦]\n\n❏Recipient not found in the bank database. Please check the recipient's ID ✖️•");
  }

  if (recipientUID === user) {
    return message.reply("[🏦 Bank 🏦]\n\n❏You cannot transfer money to yourself 😹•");
  }

  const senderBankBalance = parseFloat(bankData[user].bank) || 0;
  const recipientBankBalance = parseFloat(bankData[recipientUID].bank) || 0;

  if (recipientBankBalance >= 1e104) {
    return message.reply("[🏦 Bank 🏦]\n\n❏The recipient's bank balance is already $1e104. You cannot transfer money to them 🗿•");
  }

  if (amount > senderBankBalance) {
    return message.reply("[🏦 Bank 🏦]\n\n❏You don't have enough money in your bank account for this transfer ✖️•");
  }

  bankData[user].bank -= amount;
  bankData[recipientUID].bank += amount;
fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");


  return message.reply(`[🏦 Bank 🏦]\n\n❏Successfully transferred $${amount} to the recipient with UID: ${recipientUID} ✅•`);
break;


case "top":
  const bankDataCp = JSON.parse(fs.readFileSync('scripts/cmds/bankData.json', 'utf8'));

  const topUsers = Object.entries(bankDataCp)
    .sort(([, a], [, b]) => b.bank - a.bank)
    .slice(0, 10);

  const output = (await Promise.all(topUsers.map(async ([userID, userData], index) => {
    const userName = await usersData.getName(userID);
    const formattedBalance = formatNumberWithFullForm(userData.bank); // Format the bank balance
    return `${index + 1}. ${userName} - $${formattedBalance}`;
  }))).join('\n');

  return message.reply("[🏦 Bank 🏦]\n\n👑 𝗧𝗼𝗽 𝟭𝟬 𝗥𝗶𝗰𝗵𝗲𝘀𝘁 𝗣𝗲𝗼𝗽𝗹𝗲 𝗯𝘆 𝗕𝗮𝗻𝗸 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 ✨🤴::\n\n" + output + "");

break;


case "loan":
case "l":
  const maxLoanAmount = 1000; //increase of decrease this
  const userLoan = bankData[user].loan || 0;
  const loanPayed = bankData[user].loanPayed !== undefined ? bankData[user].loanPayed : true;

  if (!amount) {
    return message.reply("[🏦 Bank 🏦]\n\n❏Please enter a valid loan amount ✖️•");
  }

  if (amount > maxLoanAmount) {
    return message.reply("[🏦 Bank 🏦]\n\n❏The maximum loan amount is $1000 ❗•");
  }

  if (!loanPayed && userLoan > 0) {
    return message.reply(`[🏦 Bank 🏦]\n\n❏You cannot take a new loan until you pay off your current loan.\n\nYour current loan to pay: $${userLoan} 😑•`);
  }

  bankData[user].loan = userLoan + amount;
  bankData[user].loanPayed = false;
  bankData[user].bank += amount;

fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");


  return message.reply(`[🏦 Bank 🏦]\n\n❏You have successfully taken a loan of $${amount}. Please note that loans must be repaid within a certain period 😉•`);

break;

case "payloan":
  const loanBalance = bankData[user].loan || 0;

  if (isNaN(amount) || amount <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❏Please enter a valid amount to repay your loan ✖️•");
  }

  if (loanBalance <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❏You don't have any pending loan payments•\n\n✧⁺⸜(●˙▾˙●)⸝⁺✧ʸᵃʸ");
  }

  if (amount > loanBalance) {
    return message.reply(`[🏦 Bank 🏦]\n\n❏The amount required to pay off the loan is greater than your due amount. Please pay the exact amount 😊•\nYour total loan: $${loanBalance}`);
  }

  if (amount > userMoney) {
    return message.reply(`[🏦 Bank 🏦]\n\n❏You do not have $${amount} in your balance to repay the loan 😢•`);
  }

  bankData[user].loan = loanBalance - amount;

  if (loanBalance - amount === 0) {
    bankData[user].loanPayed = true;
  }

  await usersData.set(event.senderID, {
    money: userMoney - amount
  });

fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");


  return message.reply(`[🏦 Bank 🏦]\n\n❏Successfully repaid $${amount} towards your loan. Your current loan to pay: $${bankData[user].loan} ✅•`);

break;

default:
  return message.reply("[🏦 Bank 🏦]\n\n❏Please use one of the following valid commands: Deposit, Withdraw, Balance, Interest, Transfer, Richest, Loan, PayLoan");
}
  }
};

// Function to format a number with full forms (e.g., 1 Thousand, 133 Million, 76.2 Billion)
function formatNumberWithFullForm(number) {
  const fullForms = [
    "",
    "k", // Thousand
    "m", // Million
    "b", // Billion
    "t", // Trillion
    "q", // Quadrillion
    "qq", // Quintillion
    "s", // Sextillion
    "sp", // Septillion
    "o", // Octillion
    "n", // Nonillion
    "d", // Decillion
    "ud", // Undecillion
    "dd", // Duodecillion
    "td", // Tredecillion
    "qd", // Quattuordecillion
    "qd2", // Quindecillion
    "sd", // Sexdecillion
    "spd", // Septendecillion
    "od", // Octodecillion
    "nd" // Novemdecillion
  ];

  // Calculate the full form of the number (e.g., Thousand, Million, Billion)
  let fullFormIndex = 0;
  while (number >= 1000 && fullFormIndex < fullForms.length - 1) {
    number /= 1000;
    fullFormIndex++;
  }

  // Format the number with two digits after the decimal point
  const formattedNumber = number.toFixed(2);

  // Add the full form to the formatted number
  return `${formattedNumber} ${fullForms[fullFormIndex]}`;
}