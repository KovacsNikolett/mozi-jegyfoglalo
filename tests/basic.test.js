test("alap teszt működik", () => {
  expect(1 + 1).toBe(2);
});

function seatNameByNumber(number) {
  const rowLetter = String.fromCharCode(65 + Math.floor((number - 1) / 10));
  const seatNumber = ((number - 1) % 10) + 1;
  return `${rowLetter}${seatNumber}`;
}

test("szék név generálás", () => {
  expect(seatNameByNumber(1)).toBe("A1");
  expect(seatNameByNumber(10)).toBe("A10");
  expect(seatNameByNumber(11)).toBe("B1");
});
test("alap teszt működik", () => {
  expect(1 + 1).toBe(2);
});