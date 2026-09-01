// Backend Preference model (heightRange.min/max) stores height in cm
// (100-250), matching the Profile model. UI only shows ft/in - the cm
// value still goes to/from the API under the hood, so nothing on the
// backend needs to change.
export const HEIGHT_OPTIONS = (() => {
  const options = [];
  for (let feet = 4; feet <= 7; feet += 1) {
    const maxInches = feet === 7 ? 0 : 11;
    for (let inches = 0; inches <= maxInches; inches += 1) {
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      options.push({ value: cm, label: `${feet}'${inches}" (${cm} cm)` });
    }
  }
  return options;
})();

export function cmToFeetInches(cm) {
  if (cm === undefined || cm === null || cm === '') return '';
  const totalInches = Math.round(Number(cm) / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}