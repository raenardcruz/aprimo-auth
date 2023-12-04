import BaseAuthMode from "./BaseAuthModeClass";

/*
Name: PopupMode
Description: This class extends the base class BaseAuthMode to fit the scenario for using popup window to get new token
*/
export default class PopupMode extends BaseAuthMode {
  constructor(aprimo) {
    super(aprimo);
  }

  initiateGetToken(codeChallenge) {
    window.open(
      this.aprimo.getAuthorizationUrl(codeChallenge),
      "_blank",
      "width=400,height=600"
    );
  }

  isChild() {
    return window.opener;
  }

  postMessage(message) {
    window.opener.postMessage(message, window.location.origin);
    window.close();
  }
}
