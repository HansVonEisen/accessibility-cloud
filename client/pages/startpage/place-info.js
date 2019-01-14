import { Template } from 'meteor/templating';
import i18nHelpers from '/both/api/shared/i18nHelpers';
import stringHelpers from '../../lib/template-helpers/stringHelpers';


Template.page_start_place_info.helpers({
  ...stringHelpers,
  placeName() {
    const locale = window.navigator.language;
    return i18nHelpers.getLocalizedName.call(this, locale) ||
    i18nHelpers.getLocalizedCategory.call(this, locale) ||
      '';
  },
});
