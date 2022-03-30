const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: "wirhirteam@gmail.com",
		pass: "cdkt kbjt xins xbyv",
	},
});

transporter
	.verify()
	.then(() => {
		console.log("ready to send emails");
	})
	.catch(() => {
		console.log("error");
	});

module.exports = { transporter };
