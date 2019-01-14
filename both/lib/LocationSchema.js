import SimpleSchema from 'simpl-schema';

const LocationSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Point'],
  },
  coordinates: {
    type: Array,
    custom() {
      if (this.value.length !== 2) return 'needsLatLong';
      if (Math.abs(this.value[0]) > 90) return 'lonOutOfRange';
      if (Math.abs(this.value[1]) > 180) return 'lonOutOfRange';
      return undefined;
    },
  },
  'coordinates.$': Number,
});

LocationSchema.messageBox.messages({
  en: {
    needsLatLong: '[label] should be of form [longitude, latitude]',
    lonOutOfRange: '[label] longitude should be between -90 and 90',
    latOutOfRange: '[label] latitude should be between -180 and 180',
  },
});

export default LocationSchema;
