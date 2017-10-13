import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Languages = new Mongo.Collection('Languages');

Languages.schema = new SimpleSchema({
  name: { type: String },
  languageCode: { type: String },
});

Languages.attachSchema(Languages.schema);
