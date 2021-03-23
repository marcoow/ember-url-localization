import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service intl;
  @service router;

  get isEnUs() {
    return this.intl.primaryLocale === "en-us";
  }

  get isEsEs() {
    return this.intl.primaryLocale === "es-es";
  }

  @action
  setLocale(event) {
    let { value: locale } = event.target;
    this.intl.locale = locale;
    localStorage.setItem("locale", locale);
    window.location.reload(this.router.currentURL);
  }
}
