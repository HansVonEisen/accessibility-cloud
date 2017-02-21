/* globals L */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import subsManager from '/client/lib/subs-manager';
import { GlobalStats } from '/both/api/global-stats/global-stats';

Template.page_start.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('globalStats.public');
});

Template.page_start.onRendered(() => {
  const map = L.map('mapid', { zoomControl: false });
  map.fitBounds(
      [[45, -120], [-10, 120]]
  );

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGl4dHVyIiwiYSI6ImNpc2tuMWx1eDAwNHQzMnBremRzNjBqcXIifQ.3jo3ZXnwCVxTkKaw0RPlDg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'accesssibility-cloud',
    accessToken: Meteor.settings.public.mapbox || 'your.mapbox.public.access.token',
  }).addTo(map);
});

Template.page_start.helpers({
  lastCollectionCount: GlobalStats.lastCollectionCount,
});
