import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

export const ImportFlows = new Mongo.Collection('ImportFlows');

ImportFlows.schema = new SimpleSchema({
  sourceId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    label: 'Name',
    type: String,
  },
  schedule: {
    type: String,
    defaultValue: '',
    optional: true,
    uniforms: { component: HiddenField },
  },
  createdAt: {
    type: Number,
  },
  streams: {
    type: Array,
    label: 'Stream chain setup',
    optional: true,
  },
  'streams.$': {
    type: Object,
    blackbox: true,
  },
  'streams.$.type': {
    type: String,
  },
  lastImportStartedByUserId: {
    type: String,
    optional: true,
    uniforms: { component: HiddenField },
  },
  nextImportDate: {
    type: Date,
    optional: true,
    uniforms: { component: HiddenField },
  },
});

ImportFlows.attachSchema(ImportFlows.schema);

ImportFlows.helpers({
  inputMimeType() {
    const downloadItem = this.streams.find(
      ({ type }) => type === 'HTTPDownload'
    );

    return downloadItem
            && downloadItem.parameters
            && downloadItem.parameters.inputMimeType;
  },
  hasStreams() {
    return this.streams && this.streams.length > 0;
  },
  getStreams() {
    return this.streams;
  },
  getFirstStream() {
    return this.streams[0];
  },
  hasDownloadStep() {
    if (!this.streams) {
      return false;
    }

    return this.streams.some(
      step => step.type === 'HTTPDownload' && !!step.parameters.sourceUrl
    );
  },
  getFrequencyDescription() {
    return this.schedule;
  },
  getNextScheduledRunDescription() {
    if (!this.nextImportDate) return null;
    return moment(this.nextImportDate).fromNow();
  },
});

if (Meteor.isServer) {
  ImportFlows._ensureIndex({ sourceId: 1 });
}
