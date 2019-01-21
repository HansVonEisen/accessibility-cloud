import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import { HiddenField } from 'uniforms';
import { isAdmin } from '/both/lib/is-admin';
import { ImportFlows } from '/both/api/import-flows/import-flows';
import { Licenses } from '/both/api/licenses/licenses';
import { Organizations } from '/both/api/organizations/organizations';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { isUserMemberOfOrganizationWithId } from '/both/api/organizations/privileges.js';

export const Sources = new Mongo.Collection('Sources');

Sources.schema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    uniforms: { component: HiddenField },
  },
  name: {
    label: 'Name',
    uniforms: {
      placeholder: 'e.g. Places in Europe',
      autofocus: true,
    },
    type: String,
  },
  shortName: {
    label: 'Short name for backlinks (should include your Organization)',
    uniforms: {
      placeholder: 'e.g. PiE',
    },
    type: String,
    max: 20,
  },
  licenseId: {
    label: 'License',
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  description: {
    label: 'Description',
    type: String,
    uniforms: {
      placeholder: 'e.g. This source shares information about...',
      rows: 10,
    },
    optional: true,
  },
  originWebsiteURL: {
    label: 'Web-site (optional)',
    uniforms: {
      placeholder: 'e.g. https://some.site.com/1234',
    },
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  'translations.additionalAccessibilityInformation.en_US': {
    label: 'Additional accessibility information (English)',
    uniforms: {
      placeholder: 'This can be shown as an explanatory tool tip to users.',
    },
    type: String,
    optional: true,
  },
  isDraft: {
    type: Boolean,
    label: 'Only a draft (content not available to people outside your organization)',
    defaultValue: true,
    optional: true,
  },
  isFreelyAccessible: {
    type: Boolean,
    label: 'Data is available to everybody',
    defaultValue: true,
  },
  isRequestable: {
    type: Boolean,
    label: 'Access to this data source can be requested',
    defaultValue: false,
  },
  accessRestrictedTo: {
    type: Array,
    label: 'Data is available to everybody',
    defaultValue: [],
    uniforms: { component: HiddenField },
  },
  'accessRestrictedTo.$': {
    type: String,
  },
  hasRunningImport: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    uniforms: { component: HiddenField },
  },
  documentCount: {
    type: Number,
    defaultValue: 0,
    optional: true,
    uniforms: { component: HiddenField },
  },
  isShownOnStartPage: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    uniforms: { component: HiddenField },
  },
  lastImportType: {
    type: String,
    optional: true,
    uniforms: { component: HiddenField },
  },
  attributeDistribution: {
    type: Match.ObjectIncluding({}),
    optional: true,
    blackbox: true,
  },
  lastImportId: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id,
    uniforms: { component: HiddenField },
  },
  lastSuccessfulImportId: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id,
    uniforms: { component: HiddenField },
  },
});

Sources.attachSchema(Sources.schema);

Sources.relationships = {
  belongsTo: {
    license: {
      foreignCollection: Licenses,
      foreignKey: 'licenseId',
    },
  },
};

Sources.helpers({
  isFullyVisibleForUserId(userId) {
    return isAdmin(userId)
            || isUserMemberOfOrganizationWithId(userId, this.organizationId)
            || this.isFreelyAccessible;
  },
  isEditableBy(userId) {
    if (!userId) {
      return false;
    }
    return isAdmin(userId)
            || isUserMemberOfOrganizationWithId(userId, this.organizationId);
  },
  hasRestrictedAccessForUserId(userId) {
    const allowedOrganizationIDs = this.accessRestrictedTo || [];
    const userBelongsToAnAllowedOrganization = allowedOrganizationIDs.some(
      organizationId => isUserMemberOfOrganizationWithId(userId, organizationId)
    );

    return !this.isFreelyAccessible && userBelongsToAnAllowedOrganization;
  },
  isVisibleForUserId(userId) {
    return this.isFullyVisibleForUserId(userId) || this.hasRestrictedAccessForUserId(userId);
  },
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
  getLicense() {
    return Licenses.findOne(this.licenseId);
  },
  getLastSuccessfulImport() {
    return SourceImports.findOne(this.lastSuccessfulImportId);
  },
  getLastSourceImport() {
    return SourceImports.findOne(this.lastImportId);
  },
  getImportFlows() {
    return ImportFlows.find(
      { sourceId: this._id },
      { sort: { createdAt: 1 } }
    );
  },
  addImportFlow({
    name = 'Default',
    streams,
  }) {
    ImportFlows.insert({
      sourceId: this._id,
      name,
      streams,
      createdAt: Date.now(),
    });
  },
  getLastImportWithStats() {
    return SourceImports
      .find({ sourceId: this._id, isFinished: true }, { sort: { startTimestamp: -1 }, limit: 2 })
      .fetch()
      .find(i => Boolean(i.attributeDistribution));
  },
  getType() {
    const lastImport = this.getLastSuccessfulImport();
    if (!lastImport) return 'placeInfos';
    return lastImport.getType();
  },
  isPlaceInfoSource() {
    return this.getType() === 'placeInfos';
  },
});


if (Meteor.isClient) {
  window.Sources = Sources;
}
