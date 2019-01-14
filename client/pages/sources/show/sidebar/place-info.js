import { Template } from 'meteor/templating';

import './place-info.html';
import stringHelpers from '../../../../lib/template-helpers/stringHelpers';

Template.sources_show_page_place_info.helpers({
  ...stringHelpers,
});
