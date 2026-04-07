module.exports.generateDateTimeID = () => {
  const now = new Date();

  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const number = Math.floor(Math.random() * 1000) + 1;

  const datetimeId = year + month + day + hours + minutes + seconds + number;
  return parseInt(datetimeId);
};
