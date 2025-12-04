import fs from 'fs';
import path from 'path';

function logDeletedForgeButtonId(logEntry) {
  const logFile = path.resolve(process.cwd(), 'deleted-forge-button-ids.log');
  const line = JSON.stringify(logEntry) + '\n';
  try {
    fs.appendFileSync(logFile, line, { encoding: 'utf8' });
  } catch (err) {
    console.error('Failed to write to deleted-forge-button-ids.log:', err);
    console.log('Log entry:', logEntry);
  }
}

export default function migrateForgeButton($, fileName, dryRun) {
  // Toggle icon buttons
  $('forge-icon-button[toggle]').each((index, element) => {
    const $button = $(element);
    const $onElement = $button.find('[forge-icon-button-on]');

    if ($onElement.length) {
      $onElement.attr('slot', 'on');
      $onElement.removeAttr('forge-icon-button-on');
    }

    $button.attr('toggle', '');

    if ($button.attr('is-on') !== undefined) {
      $button.attr('on', '');
      $button.removeAttr('is-on');
    }

    if ($button.attr('[isOn]')) {
      $button.attr('[on]', $button.attr('[isOn]'));
      $button.removeAttr('[isOn]');
    }
  });

  // Remove nested <button> elements and move attributes and children to parent
  $('forge-button, forge-icon-button, forge-fab').each((index, element) => {
    const $forgeButton = $(element);
    const $nestedButton = $forgeButton.children('button').first();

    if ($nestedButton.length === 0) return;

    // Track id changes if both have id
    const forgeId = $forgeButton.attr('id');
    const nestedId = $nestedButton.attr('id');

    if (forgeId && nestedId) {
      logDeletedForgeButtonId({
        originalId: forgeId,
        replacementId: nestedId,
        file: fileName,
        line: 'unknown' // Cheerio doesn't provide line numbers
      });

      $forgeButton.attr('id', nestedId);
    }

    migrateButtonAttributes($forgeButton, $nestedButton);

    // Copy all attributes from nested button to forge button
    const nestedAttrs = $nestedButton.get(0).attribs || {};
    Object.entries(nestedAttrs).forEach(([name, value]) => {
      $forgeButton.attr(name, value);
    });

    // Move children from nested button to forge button
    $nestedButton.contents().each((i, child) => {
      $forgeButton.append(child);
    });

    $nestedButton.remove();
  });

  // Nested anchors
  $('forge-button, forge-icon-button, forge-fab').each((index, element) => {
    const $forgeButton = $(element);
    const $nestedAnchor = $forgeButton.children('a').first();

    if ($nestedAnchor.length === 0) return;

    migrateButtonAttributes($forgeButton, $nestedAnchor);
  });

  // Icon button density-level mapping
  $('forge-icon-button[density-level]').each((index, element) => {
    const $button = $(element);
    const densityLevel = $button.attr('density-level');

    const DENSITY_MAP = {
      '1': 'large',
      '2': 'medium',
      '3': 'medium',
      '4': 'small',
      '5': 'small',
      '6': 'small'
    };

    const newDensity = DENSITY_MAP[densityLevel];
    if (!newDensity || newDensity === 'small') {
      $button.attr('dense', '');
    } else {
      $button.attr('density', newDensity);
    }
    $button.removeAttr('density-level');
  });

  // Rename leading and trailing slots to start and end
  $('forge-button').each((index, element) => {
    const $button = $(element);

    $button.find('[slot="leading"]').attr('slot', 'start');
    $button.find('[slot="trailing"]').attr('slot', 'end');
  });

  // Move nested tooltips - simplified version
  $('forge-button, forge-icon-button, forge-fab').each((index, element) => {
    const $button = $(element);
    const $tooltip = $button.find('forge-tooltip').first();

    if ($tooltip.length) {
      $tooltip.detach();
      $button.after($tooltip);
    }
  });
}

function migrateButtonAttributes($forgeButton, $nestedElement) {
  // Translate the `type` attribute to the `variant` and `dense` attributes
  const typeAttr = $forgeButton.attr('type');
  if (typeAttr) {
    if (typeAttr.includes('dense')) {
      $forgeButton.attr('dense', '');
    }

    let variant = typeAttr.replace(/-?dense/, '').trim();
    if (variant === 'unelevated') {
      variant = 'filled';
    } else if (variant === 'dense') {
      variant = undefined;
    }

    const validVariants = ['text', 'outlined', 'tonal', 'filled', 'raised', 'link'];
    if (validVariants.includes(variant)) {
      $forgeButton.attr('variant', variant);
    }
    $forgeButton.removeAttr('type');
  }

  // Handle Angular binding syntax
  const typeBinding = $forgeButton.attr('[type]');
  if (typeBinding) {
    $forgeButton.attr('[variant]', typeBinding);
    $forgeButton.removeAttr('[type]');
  }

  // Remove default type="button" from nested elements
  if ($nestedElement.attr('type') === 'button') {
    $nestedElement.removeAttr('type');
  }
}
