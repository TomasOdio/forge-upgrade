export default function migrateForgeTabs($, fileName, dryRun) {
  // Slot adjustments for forge-tab
  $('forge-tab').each((index, element) => {
    const $tab = $(element);

    // Rename the "leading" slot to "start"
    $tab.find('[slot="leading"]').attr('slot', 'start');

    // Rename the "trailing" slot to "end"
    $tab.find('[slot="trailing"]').attr('slot', 'end');
  });
}
