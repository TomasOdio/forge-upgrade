export default function migrateForgeCheckboxRadioSwitch($, fileName, dryRun) {
  // Remove nested input and move attributes to parent
  $('forge-checkbox, forge-radio').each((index, element) => {
    const $parent = $(element);
    const $nestedInput = $parent.find('input').first();

    if ($nestedInput.length === 0) return;

    // Copy all attributes from the nested input to the forge checkbox/radio
    const inputAttrs = $nestedInput.get(0).attribs || {};
    Object.entries(inputAttrs).forEach(([name, value]) => {
      if (name !== 'type') { // Remove the type attribute from the parent
        $parent.attr(name, value);
      }
    });

    // Move all nested children to the parent
    $nestedInput.contents().each((i, child) => {
      $parent.append(child);
    });

    // Remove the nested input
    $nestedInput.remove();
  });

  // Remove nested label and move children to parent
  $('forge-checkbox, forge-radio').each((index, element) => {
    const $parent = $(element);
    const $nestedLabel = $parent.find('label').first();

    if ($nestedLabel.length === 0) return;

    // Move all nested children to the parent
    $nestedLabel.contents().each((i, child) => {
      $parent.append(child);
    });

    // Remove the nested label
    $nestedLabel.remove();
  });

  // Rename switch "selected" attribute to "on"
  $('forge-switch[selected]').each((index, element) => {
    const $switch = $(element);
    $switch.removeAttr('selected');
    $switch.attr('on', '');
  });
}
