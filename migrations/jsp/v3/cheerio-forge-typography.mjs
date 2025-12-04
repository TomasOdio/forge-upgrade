export default function migrateForgeTypography($, fileName, dryRun) {
  // Remove forge-typography class from all elements
  $('.forge-typography').each((index, element) => {
    const $el = $(element);
    const currentClass = $el.attr('class') || '';
    const classArray = currentClass.split(/\s+/).filter(cls => cls !== 'forge-typography' && cls !== '');

    if (classArray.length > 0) {
      $el.attr('class', classArray.join(' '));
    } else {
      $el.removeAttr('class');
    }
  });
}

