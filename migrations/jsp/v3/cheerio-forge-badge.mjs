export default function migrateForgeBadge($, fileName, dryRun) {
  // Update the leading/trailing slot names to start/end
  $('forge-badge').each((index, element) => {
    const $badge = $(element);

    // Rename "leading" slot to "start"
    $badge.find('[slot="leading"]').attr('slot', 'start');

    // Rename "trailing" slot to "end"
    $badge.find('[slot="trailing"]').attr('slot', 'end');
  });
}
