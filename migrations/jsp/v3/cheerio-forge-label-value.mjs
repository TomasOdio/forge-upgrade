export default function migrateForgeLabelValue($, fileName, dryRun) {
  // Remove the label-value "dense" attribute in favor of "inline"
  $('forge-label-value[dense]').each((index, element) => {
    const $labelValue = $(element);
    $labelValue.attr('inline', '');
    $labelValue.removeAttr('dense');
  });
}

