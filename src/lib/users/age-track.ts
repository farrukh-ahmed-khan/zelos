export function deriveAgeTrack(age: number) {
  if (age < 13) {
    return "child";
  }

  if (age < 18) {
    return "teen";
  }

  if (age < 25) {
    return "young-adult";
  }

  return "adult";
}
