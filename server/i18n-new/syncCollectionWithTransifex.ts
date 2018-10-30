import { registerLocale, cacheRegisteredLocales } from '../../both/i18n/locales';
import { get } from 'lodash';
import { TranslationDescriptor, MsgidsToTranslationDescriptors } from './i18nTypes';
import displayStats from "./displayStats";
import exportToTransifex from "./exportToTransifex";
import importFromTransifex from './importFromTransifex';
import generateEmptyPoFile from "./generateEmptyPoFile";
import getSupportedLocales from "./getSupportedLocales";
import resourceSlugForCollection from './resourceSlugForCollection';
import returnNullIf404 from "./returnNullIf404";
import stripTranslations from "./stripTranslations";
import updateAndPruneUnusedStringsFromPOFile from "./updateAndPruneUnusedStringsFromPOFile";
import databaseLayer from './databaseLayer';


// Imports strings from transifex, writes new translations into the given documents and removes
// strings from the translation template that are not in the DB anymore (they stay in translation
// memory on transifex). Strings from given documents that are not found in transifex yet are
// uploaded to transifex to be translated.
export default function syncCollectionWithTransifex({
  translationDescriptors,
  // PO files support the same msgid key string to appear in different contexts.
  context = '',
  collection,
  // language of the source strings to be translated
  defaultLocale = 'en_US',
}: {
    context?: string;
    defaultLocale?: string;
    translationDescriptors: TranslationDescriptor[];
    collection: any;
  }) {
  // slug name of the transifex resource that should be used for syncing
  const resourceSlug = resourceSlugForCollection(collection);
  console.log('Starting transifex synchronization for', resourceSlug, `(Context: '${context}')`);

  // msgids / key strings to documents that contain the translations
  const msgidsToDocs: MsgidsToTranslationDescriptors = {};
  collection.find().fetch()
    .forEach((doc: object) => {
      translationDescriptors.forEach(translationDescriptor => {
        const msgid = translationDescriptor.msgidFn(translationDescriptor.propertyName)(doc);
        if (!databaseLayer.getLocalTranslation({ doc, locale: defaultLocale, translationDescriptor })) {
          return;
        }
        msgidsToDocs[msgid] = { translationDescriptor, doc };
      });
    });

  console.log('msgids to translate:', Object.keys(msgidsToDocs));


  try {
    getSupportedLocales(resourceSlug, defaultLocale).forEach(locale => {
      registerLocale(resourceSlug, locale);
      const remotePoFile = returnNullIf404(importFromTransifex)(resourceSlug, locale);
      if (!remotePoFile) {
        console.log('Remote language', locale, 'not existing yet.');
      }
      const poFile = remotePoFile || generateEmptyPoFile(locale);
      displayStats({ resourceSlug, locale, poFile, msgidsToDocs, context });
      const mergedTranslations = updateAndPruneUnusedStringsFromPOFile({
        poFile,
        context,
        msgidsToDocs,
        collection,
      });
      if (locale === defaultLocale) {
        console.log('Syncing PO file for', locale, 'language...');
        // Source files can't have translations on transifex, so strip them.
        exportToTransifex({
          resourceSlug,
          poFile: stripTranslations(mergedTranslations),
          asSourceFile: true,
          isNewResource: !remotePoFile,
        });
      }
      exportToTransifex({
        resourceSlug,
        poFile: mergedTranslations,
        asSourceFile: false,
        isNewResource: false,
      });
    });
    cacheRegisteredLocales(resourceSlug);
  }
  catch (error) {
    console.error('Error while syncing with transifex:', error, error.stack);
    return false;
  }
  return true;
}