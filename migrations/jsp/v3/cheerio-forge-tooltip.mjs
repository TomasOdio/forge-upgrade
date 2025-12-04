export default function migrateForgeTooltip($, fileName, dryRun) {
  $('forge-tooltip').each((index, element) => {
    const $tooltip = $(element);

    // Rename the "target" attribute to "anchor"
    const target = $tooltip.attr('target');
    if (target) {
      const value = target.replace(/^#/g, '');
      $tooltip.attr('anchor', value);
      $tooltip.removeAttr('target');
    }

    // Rename the "position" attribute to "placement"
    const position = $tooltip.attr('position');
    if (position) {
      $tooltip.attr('placement', position);
      $tooltip.removeAttr('position');
    }
  });
}
