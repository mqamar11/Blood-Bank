const path = require("path");

const validateImage = (files) => {
  const allowed_extensions = [
    "jpg",
    "jpeg",
    "png",
    "bmp",
    "gif",
    "svg",
    "webp",
  ];
  const extension = path
    .extname(files.profile_picture.name)
    .toLowerCase()
    .replace(".", "");

  if (!allowed_extensions.includes(extension)) {
    return `Profile picture can be of following type: ${allowed_extensions.toString()}`;
  }

  return "";
};

module.exports = {
  validateImage,
};
