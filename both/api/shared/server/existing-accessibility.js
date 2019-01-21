import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';

// Returns MongoDB query options for given request

export default function existingAccessibilitySelector(req, _id) {
  if (_id) return {};

  const fieldsQuery = _.pick(req.query, 'includePlacesWithoutAccessibility');

  const schema = new SimpleSchema({
    includePlacesWithoutAccessibility: {
      type: Number,
      optional: true,
      allowedValues: [0, 1],
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery, { mutate: true });

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  if (fieldsQuery.includePlacesWithoutAccessibility === 1) {
    return {};
  }

  return { 'properties.accessibility': { $exists: true } };
}
