import fastlyPurgeQueue from './fastlyPurgeQueue';
import sendPurgeRequestToFastly from './sendPurgeRequestToFastly';

export default function flushPurgeQueue() {
  console.log('Purging keys on fastly…');
  let keyBatch: string[] = [];
  const purge = () => {
    if (keyBatch.length) {
      sendPurgeRequestToFastly(keyBatch);
      keyBatch.forEach(key => fastlyPurgeQueue.remove(key));
      keyBatch = [];
    }
  };
  fastlyPurgeQueue
    .find()
    .forEach((doc) => {
      keyBatch.push(doc._id);
      if (keyBatch.length === 128) {
        purge();
      }
    });
  purge();
}

