import HistoryLocation from '@ember/routing/history-location';
import { inject as service } from '@ember/service';

export default class MineLocation extends HistoryLocation {
  @service intl;

  getURL() {
    let path = super.getURL(...arguments);
    path = this._stripLocalePrefix(path);
    return path;
  }

  formatURL(path) {
    let superResult = super.formatURL(...arguments);
    if (!superResult.startsWith(`/${this.intl.primaryLocale}/`)) {
      let routeSuffix = superResult.startsWith("/") ? superResult : `/${superResult}`;
      superResult = `/${this.intl.primaryLocale}${routeSuffix}`;
    }
    return superResult;
  }

  _stripLocalePrefix(path) {
    for (let locale of this.intl.locales) {
      let prefix = buildLocalePrefixRegexp(locale);
      path = path.replace(prefix, "");
    }
    return path;
  }
}

function buildLocalePrefixRegexp(locale) {
  return new RegExp(`^\/${locale}\/`);
}
