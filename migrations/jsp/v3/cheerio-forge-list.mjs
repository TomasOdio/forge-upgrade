export default function migrateForgeList($, fileName, dryRun) {
  // Remove the "static" attribute as list items are now static by default
  $('forge-list[static]').each((index, element) => {
    const $list = $(element);
    $list.removeAttr('static');
  });

  // Remove the "static" attribute as list items are now static by default
  $('forge-list-item[static]').each((index, element) => {
    const $item = $(element);
    $item.removeAttr('static');
  });

  // Add "navlist" attribute to <forge-list> elements if they are within a drawer
  $('forge-drawer, forge-modal-drawer, forge-mini-drawer').each((index, element) => {
    const $drawer = $(element);
    const $lists = $drawer.find('forge-list');
    $lists.each((i, list) => {
      $(list).attr('navlist', '');
    });
  });

  // Slot adjustments for forge-list-item
  $('forge-list-item').each((index, element) => {
    const $item = $(element);

    // Rename the "leading" slot to "start"
    $item.find('[slot="leading"]').attr('slot', 'start');

    // Rename the "trailing" slot to "end"
    $item.find('[slot="trailing"]').attr('slot', 'end');

    // Remove the "title" slot; is now the default slot
    $item.find('[slot="title"]').removeAttr('slot');

    // Rename the "subtitle" slot to "secondary-text"
    $item.find('[slot="subtitle"]').attr('slot', 'secondary-text');

    // Rename the "tertiary-title" slot to "tertiary-text"
    $item.find('[slot="tertiary-title"]').attr('slot', 'tertiary-text');

    // Rename the "avatar" slot to "leading"
    $item.find('[slot="avatar"]').attr('slot', 'leading');
  });
}
