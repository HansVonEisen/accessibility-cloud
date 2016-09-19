import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.page_home.onCreated(function() {
  const self = this;

  self.autorun(function() {
    self.subscribe('organizations.public');
  });
});

Template.page_home.helpers({
  post() {
    return Organizations.findOne({ slug: FlowRouter.getParam('slug') });
  },
  organizations() {
    //return [{name:"bla"}, {name:"bladf"}];
    const orgCursor= Organizations.find({});
    console.log(orgCursor);
    return orgCursor;
  },
});