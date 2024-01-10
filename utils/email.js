const sgMail = require("@sendgrid/mail");

async function sendMail(
  user = { username: "", email: "" },
  path = "http://localhost:3000",
  isGameStarted = false
) {
  try {
    sgMail.setApiKey(process.env.API_SENDGRID_MAIL);

    let content = `<h1>Dear ${user.username}!</h1>
        <p>You purchased NFT successful. We will notify you via email when game start.</p>
        <p>Visit link to more information ${path}
        <p>Best regards</p>`;

    if (isGameStarted) {
      content = `<h1>Dear ${user.username}!</h1>
            <p>You purchased NFT successful.</p>
            <p>Game goes live in 24 hours.</p>
            <p>Visit link to more information ${path}
            <p>Best regards</p>`;
    }

    const message = {
      to: user.email,
      from: process.env.USER_MAIL,
      subject: process.env.SUBJECT_MAIL,
      html: content,
    };
    await sgMail.send(message);

    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { sendMail };
