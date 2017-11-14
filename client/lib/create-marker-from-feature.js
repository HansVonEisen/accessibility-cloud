/* globals L */
import L from 'leaflet';
import { _ } from 'lodash';

// Extend Leaflet-icon to support colors and category-images
const AccessibilityIcon = L.Icon.extend({
  options: {
    number: '',
    shadowUrl: null,
    className: 'leaflet-div-icon accessiblity',
  },

  createIcon() {
    const div = document.createElement('div');
    const img = this._createImg(this.options.iconUrl);
    div.appendChild(img);
    this._setIconStyles(div, 'icon');
    return div;
  },

  createShadow() {
    return null;
  },
});

export const EquipmentIcon = L.Icon.extend({
  options: {
    number: '',
    shadowUrl: null,
    className: 'leaflet-div-icon equipment',
  },

  createIcon() {
    const div = document.createElement('div');
    const img = this._createImg(this.options.iconUrl);
    div.appendChild(img);
    this._setIconStyles(div, 'icon');
    return div;
  },

  createShadow() {
    return null;
  },
});


function getColorForWheelchairAccessiblity(placeData) {
  try {
    if (_.get(placeData, 'properties.accessibility.accessibleWith.wheelchair') === true) {
      return 'green';
    } else if (_.get(placeData, 'properties.accessibility.partiallyAccessibleWith.wheelchair')) {
      return 'orange';
    } else if (_.get(placeData, 'properties.accessibility.accessibleWith.wheelchair') === false) {
      return 'red';
    }
  } catch (e) {
    console.warn('Failed to get color for', placeData, e);
  }
  return 'grey';
}

export default function createMarkerFromFeature({
  feature,
  latlng,
  size = 1,
  IconClass = AccessibilityIcon,
}) {
  const categoryIconName = _.get(feature, 'properties.category') || 'place';
  const color = getColorForWheelchairAccessiblity(feature);
  const acIcon = new IconClass({
    iconUrl: `/icons/categories/${categoryIconName}@${size * 2}x.png`,
    className: `ac-marker ${color}`,
    iconSize: new L.Point(27, 27).multiplyBy(size),
    iconAnchor: new L.Point(13, 25).multiplyBy(size),
    popupAnchor: new L.Point(0, -33).multiplyBy(size),
  });
  return L.marker(latlng, { icon: acIcon });
}
