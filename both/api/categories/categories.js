import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

export const Categories = new Mongo.Collection('Categories');


/*
{
  _id: "atm",
  translations: {
    _id: {
      "de_DE": "Geldautomat",
      "en_US": "ATM",
    }
  },
  synonyms: ["ATM", "amenity=atm"],
  icon: "atm",
  parentIds:["leisure", "money"],  // top-level category if empty
}
*/

Categories.schema = new SimpleSchema({
  icon: {
    type: String,
    label: 'Icon URL (optional)',
    regEx: /[a-z-.]+/,
  },
  synonyms: {
    type: Array,
  },
  'synonyms.$': {
    type: String,
  },
  parentIds: {
    type: Array,
  },
  'parentIds.$': {
    type: String,
  },
  translations: {
    type: Match.ObjectIncluding({}),
    blackbox: true,
  },
  'translations._id': {
    type: Match.ObjectIncluding({}),
    blackbox: true,
  },
  'translations._id.$': {
    type: String,
  },
});

Categories.attachSchema(Categories.schema);

Categories.visibleSelectorForUserId = () => ({});
Categories.visibleSelectorForAppId = () => ({});
Categories.apiParameterizedSelector = selector => selector;
