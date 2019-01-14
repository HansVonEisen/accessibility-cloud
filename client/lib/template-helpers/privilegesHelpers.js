// import '/imports/startup/client';
// import '/imports/startup/both';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { isApproved } from '/both/lib/is-approved';
import { isAdmin } from '/both/lib/is-admin';

const privilegesHelpers = {
  isAdmin() {
    const userId = Meteor.userId();
    return userId && isAdmin(userId);
  },
  isApproved() {
    const userId = Meteor.userId();
    return userId && isApproved(userId);
  },
  userCanAccessPageWithCurrentApprovalState() {
    FlowRouter.watchPathChange();
    const userId = Meteor.userId();
    return FlowRouter.current().route.options.isAccessibleWithoutApproval ||
      (userId && isApproved(userId));
  },
};

export default privilegesHelpers;
