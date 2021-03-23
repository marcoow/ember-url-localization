import HistoryLocation from "@ember/routing/history-location";
import { inject as service } from "@ember/service";

export default class MineLocation extends HistoryLocation {
  @service intl;

  getURL() {
    let path = super.getURL(...arguments);
    path = this._stripLocalePrefix(path);
    let internalPath = mapLocalisedToInternalURL(path, this.intl.currentLocale);
    debugger;
    // TODO: reverse-translate url from this.intl.currentLocale
    return path;
  }

  formatURL() {
    let url = super.formatURL(...arguments);
    // TODO: translate url to this.intl.currentLocale
    let localePrefix = buildLocalePrefixRegexp(this.intl.primaryLocale);
    if (!url.match(localePrefix)) {
      let urlSuffix = url.startsWith("/") ? url : `/${url}`;
      url = `/${this.intl.primaryLocale}${urlSuffix}`;
    }
    return url;
  }

  _stripLocalePrefix(path) {
    for (let locale of this.intl.locales) {
      let prefix = buildLocalePrefixRegexp(locale);
      path = path.replace(prefix, "");
    }
    return path;
  }
}

export function buildLocalePrefixRegexp(locale) {
  return new RegExp(`^\/${locale}\/`);
}

const translations = {
  en: {
    about: 0,
    teachers: 1,
    songs: 2,
  },
  es: {
    "acerca-de": 0,
    profesores: 1,
    canciones: 2,
  },
};

const internalURLValues = {
  0: "about",
  1: "teachers",
  2: "songs",
};

export function mapLocalisedToInternalURL(url, selectedLocale = "es") {
  let urlSegements = url.split("/");
  let activeTranslations = translations[selectedLocale];
  return urlSegements.map((urlSegment) => {
    if (activeTranslations.hasOwnProperty(urlSegment)) {
      return internalURLValues[activeTranslations[urlSegment]];
    }
    return urlSegment;
  });
}
