import CryptoJS from "crypto-js";

export function generateCodeVerifier(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function generateCodeChallenge(code_verifier) {
  return base64URL(CryptoJS.SHA256(code_verifier));
}

export function encrypt(message, key) {
  var encrypted = CryptoJS.AES.encrypt(message, key);
  return encrypted;
}

export function decrypt(encrptedMessage, key) {
  var decrypted = CryptoJS.AES.decrypt(encrptedMessage, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function base64URL(value) {
  return value
    .toString(CryptoJS.enc.Base64)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function urlReWrite(path) {
  window.history.replaceState({}, document.title, path);
}
