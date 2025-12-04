export default function migrateForgeCard($, fileName, dryRun) {
  // Remove the `outlined` attribute from forge-card
  $('forge-card[outlined]').each((index, element) => {
    const $card = $(element);
    $card.removeAttr('outlined');
  });

  // Change the `has-padding="false"` attribute to `no-padding`
  $('forge-card[has-padding="false"]').each((index, element) => {
    const $card = $(element);
    $card.removeAttr('has-padding');
    $card.attr('no-padding', '');
  });
}
