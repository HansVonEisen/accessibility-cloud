import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { isApproved } from '/both/lib/is-approved';

const routingHelpers = {
  FlowRouter,
  userCanAccessPageWithCurrentApprovalState() {
    FlowRouter.watchPathChange();
    const userId = Meteor.userId();
    return (
      FlowRouter.current().route.options.isAccessibleWithoutApproval ||
      (userId && isApproved(userId))
    );
  },
  activeIfRouteNameStartsWith(routeName) {
    FlowRouter.watchPathChange();
    return FlowRouter.current().route.name.startsWith(routeName)
      ? 'active'
      : '';
  },
  activeIfRouteNameIs(routeName) {
    FlowRouter.watchPathChange();
    return routeName === FlowRouter.current().route.name ? 'active' : '';
  },
  activeIfRouteNameMatches(regex) {
    FlowRouter.watchPathChange();
    const currentRouteName = FlowRouter.current().route.name;
    return currentRouteName.match(regex) ? 'active' : '';
  },
  activeIfRouteGroupNameMatches(regex) {
    FlowRouter.watchPathChange();
    if (FlowRouter.current().route.group) {
      const groupName = FlowRouter.current().route.group.name;
      return groupName.match(new RegExp(regex, 'ig')) ? 'active' : '';
    }
    return false;
  },
};

export default routingHelpers;
