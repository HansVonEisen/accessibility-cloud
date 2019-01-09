import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { isAdmin } from '/both/lib/is-admin';

Meteor.methods({
  'users.approve'(_id) {
    check(_id, String);
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You are not authorized to import categories.');
    }
    const user = Meteor.users.find({ _id });
    if (!user) {
      throw new Meteor.Error(403, 'Can not find user with this id.');
    }
    Meteor.users.update({ _id }, { $set: { isApproved: true } });
  },
  'users.remove'(_id) {
    check(_id, String);
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You are not authorized to import categories.');
    }
    const user = Meteor.users.find({ _id });
    if (!user) {
      throw new Meteor.Error(403, 'Can not find user with this id.');
    }
    Meteor.users.remove({ _id });
  },
});
