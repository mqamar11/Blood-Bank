const nodemailer = require("nodemailer");
const ejs = require("ejs");
const _ = require("lodash");
const logger = require("@base/logger");
const config = require("@config");
const { host, port, userName, password, fromAddress, fromName } = config.mail;

const sendEmail = async (options) => {
  return new Promise(async (resolve, reject) => {
    const { email, subject, file_name } = options;
    const data = _.omit(options, ["email", "subject", "file_name"]);
    data.from_name = fromName;

    ejs.renderFile(
      `${__dirname}/../views/emails/${file_name}.ejs`,
      { data },
      async (err, html) => {
        if (err) return logger.warn(`Email send error:`, err);

        const transporter = nodemailer.createTransport({
          host,
          port,
          auth: {
            user: userName,
            pass: password,
          },
        });

        const message = {
          // from: fromAddress,
          from: {
            name: fromName,
            address: fromAddress,
          },
          to: email,
          subject,
          html,
        };

        transporter.sendMail(message, (error, info) => {
          if (error) {
            resolve(error);
          } else {
            resolve(info);
          }
        });
      }
    );
  });
};

module.exports = sendEmail;
