require('dotenv/config');
// Constantes de l'application
const APP_NAME = 'All Sports'
const JWT_KEY = "4SIQr7JeVfCOlmExJlC6WlH6exxtXvOoGfecDfY1ujqWspqzGIE24wUKSNbVV";
const SECRET_KEY = "TtjWnZr4u7x!z%C*F-JaNdRgUkXp2s5v8y/B?D(G+KbPeShVmYq3t6w9z$C&F)H@McQfTjWnZr4u7x!A%D*G-KaNdRgUkXp2s5v8y"
const TOKEN_TIME_EXPIRES = '1d';
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;
const LOGIN_MAX_LENGTH = 12;
const LOGIN_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 8;
const PASSWORD_MIN_LENGTH = 4;
const HOSTS_ALLOWED_ORIGIN = ['http://localhost:4200'];
const PUBLIC_FOLDER_PATH = 'src/public';
const STATIC_PATH = '/static';
const PUBLIC_FOLDER_WEB_PATH = process.env.APP_HOST + ':' + process.env.APP_PORT + STATIC_PATH;
const {htmlMailTemp} = require('../config/mailtemp')


MAIL_HOST = ''
MAIL_HOST_PORT = 587
MAIL_HOST_USER = ''
MAIL_HOST_PASS = ''
MAIL_SENDER_ADDRESS = '"'
MAIL_REPLYTO_ADDRESS = '"'





//  
DOMAIN = 'localhost:4200'


module.exports = {
    JWT_KEY,
    EMAIL_REGEX,
    PASSWORD_REGEX,
    LOGIN_MAX_LENGTH,
    LOGIN_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    HOSTS_ALLOWED_ORIGIN,
    PUBLIC_FOLDER_PATH,
    PUBLIC_FOLDER_WEB_PATH,
    STATIC_PATH,
    TOKEN_TIME_EXPIRES,
    MAIL_HOST,
    MAIL_HOST_PORT,
    MAIL_HOST_USER,
    MAIL_HOST_PASS,
    MAIL_SENDER_ADDRESS,
    MAIL_REPLYTO_ADDRESS,
    PEC_MAIL_HOST,
    PEC_MAIL_HOST_PORT,
    PEC_MAIL_HOST_USER,
    PEC_MAIL_HOST_PASS,
    PEC_MAIL_SENDER_ADDRESS,
    PEC_MAIL_REPLYTO_ADDRESS,
    PEC_MAIL_SUBJECT_LIGNE,
    DOMAIN,
    RECAPTCHA_SECRET_KEY,
    htmlMailTemp,
    Export_CSV_SUBJECT_LINE,
    APP_NAME,
    PEC_MAIL_SUBJECT_LIGNE_DELETE,
    DELETE_COMMUNE_SUBJECT_LINE,
    SECRET_KEY,
 
  }