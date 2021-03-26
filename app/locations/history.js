import HistoryLocation from '@ember/routing/history-location';
import { inject as service } from '@ember/service';

const DEFAULT_LOCALE = "en-us";

//const TRANSLATIONS = {
//  "es-es": {
//    ["songs", "canciones"]: {
//      ["library", "biblioteca"]: {
//        DYNAMIC_SEGMENT: {
//          ["reviews", "criticas"]: {}
//        }
//      }
//    }
//  }
//};

const TRANSLATIONS = {
  "es-es": {
    "songs": {
      value: "canciones",
      children: {
        "library": {
          value: "biblioteca",
          children: {
            isDynamicSegment: true,
            children: {
              "reviews": {
                value: "ciriticas"
              }
            },
            "about": {
              value: "sobre"
            }
          }
        }
      }
    }
  }
};

export default class MineLocation extends HistoryLocation {
  @service intl;

  getURL() {
    let path = super.getURL(...arguments);
    path = this._stripLocalePrefix(path);
    // TODO: reverse-translate url from this.intl.currentLocale
    return path;
  }

  formatURL() {
    let url = super.formatURL(...arguments);
    if (this.intl.primaryLocale !== DEFAULT_LOCALE) {
      let translatedPaths = this._translatePaths(url);
      console.log(translatedPaths);
    }
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

  _translatePaths(url) {
    let translations = TRANSLATIONS[this.intl.primaryLocale];
    let paths = url.split("/").filter((path) => path.length > 0);
    let translatedPaths = paths.reduce((acc, path) => {
      let translationData = translations[path.toLowerCase()];
      if (!translationData && translations.isDynamicSegment) {
        translationData = translations;
        acc.push(path);
      } else {
        acc.push(translationData.value);
      }
      translations = translationData.children;
      return acc;
    }, []);
    return translatedPaths.join("/")
  }
}

export function buildLocalePrefixRegexp(locale) {
  return new RegExp(`^\/${locale}\/`);
}
