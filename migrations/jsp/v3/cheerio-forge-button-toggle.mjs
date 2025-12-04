export default function migrateForgeButtonToggle($, fileName, dryRun) {
  // Rename the leading/trailing slots to start/end
  $('forge-button-toggle').each((index, element) => {
    const $toggle = $(element);

    // Rename "leading" slot to "start"
    $toggle.find('[slot="leading"]').attr('slot', 'start');

    // Rename "trailing" slot to "end"
    $toggle.find('[slot="trailing"]').attr('slot', 'end');
  });
}
