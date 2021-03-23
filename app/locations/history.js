import HistoryLocation from '@ember/routing/history-location';
import { inject as service } from '@ember/service';

export default class MineLocation extends HistoryLocation {
  @service intl;

  getURL() {
    let path = super.getURL(...arguments);
    path = this._stripLocalePrefix(path);
    return path;
  }

  formatURL() {
    let url = super.formatURL(...arguments);
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
