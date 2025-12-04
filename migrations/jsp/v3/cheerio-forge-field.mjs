export default function migrateForgeField($, fileName, dryRun) {
  // Update the slot names for field-aware elements
  $('forge-text-field, forge-select').each((index, element) => {
    const $field = $(element);

    // Rename "leading" slot to "start"
    $field.find('[slot="leading"]').attr('slot', 'start');

    // Rename "trailing" slot to "end"
    $field.find('[slot="trailing"]').attr('slot', 'end');

    // Rename "addon-end" slot to "accessory"
    $field.find('[slot="addon-end"]').attr('slot', 'accessory');

    // Rename "helper-text" slot to "support-text"
    $field.find('[slot="helper-text"]').attr('slot', 'support-text');
  });
}
