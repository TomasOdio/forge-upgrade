export default function migrateForgeDensity($, fileName, dryRun) {
  // Update `density` attribute values
  $('[density="roomy"], [density="default"], [density="dense"]').each((index, element) => {
    const $el = $(element);
    const density = $el.attr('density');

    if (density === 'roomy') {
      $el.attr('density', 'extra-large');
    } else if (density === 'dense') {
      $el.attr('dense', '');
      $el.removeAttr('density');
    } else if (density === 'default') {
      $el.removeAttr('density');
    }
  });
}

