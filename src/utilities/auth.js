/* ===== ./src/utils/AuthService.js ===== */
import Auth0Lock from 'auth0-lock'
import EventEmitter from 'events';

export default class AuthService extends EventEmitter {
  constructor(clientId, domain) {
    super();
    // Configure Auth0
    this.lock = new Auth0Lock(clientId, domain, {})
    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', this._doAuthentication.bind(this))
    // binds login functions to keep this context
    this.login = this.login.bind(this)
  }

  _doAuthentication(tokenPaylod){
    this.lock.getUserInfo(tokenPaylod.accessToken, (error, profile) => {
      if (error) {
        this.emit('error', error);
        return;
      }
      this.setProfile(profile);
      this.emit('authenticated', profile, tokenPaylod);
    });

    // Saves the user token
    this.setToken(tokenPaylod.idToken)
  }

  login() {
    // Call the show method to display the widget.
    this.lock.show()
  }

  logout() {
    localStorage.clear();
  }

  setProfile(profile) {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }

  getProfile() {
    return JSON.parse(localStorage.getItem('user_profile'));
  }

  loggedIn(){
    // Checks if there is a saved token and it's still valid
    return !!this.getToken()
  }

  setToken(idToken){
    // Saves user token to localStorage
    localStorage.setItem('scaphold_user_token', idToken)
  }

  getToken(){
    // Retrieves the user token from localStorage
    return localStorage.getItem('scaphold_user_token')
  }
}
