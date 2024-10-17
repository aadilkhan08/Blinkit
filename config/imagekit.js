const ImageKit = require('imagekit');
require('dotenv').config() 

const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: 'https://ik.imagekit.io/vx6vrnk3r'
});

module.exports = imagekit;