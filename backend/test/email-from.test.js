const test = require('node:test');
const assert = require('node:assert/strict');
const { getResendFromAddress } = require('../src/services/email.service');

test('getResendFromAddress handles edge cases properly', async (t) => {
  await t.test('converts bare domain to KindLink <noreply@domain>', () => {
    assert.equal(getResendFromAddress('sandeepa.dev'), 'KindLink <noreply@sandeepa.dev>');
    assert.equal(getResendFromAddress('  sandeepa.dev  '), 'KindLink <noreply@sandeepa.dev>');
  });

  await t.test('strips accidental quotes around from value', () => {
    assert.equal(getResendFromAddress('"sandeepa.dev"'), 'KindLink <noreply@sandeepa.dev>');
    assert.equal(getResendFromAddress("'sandeepa.dev'"), 'KindLink <noreply@sandeepa.dev>');
    assert.equal(
      getResendFromAddress('"KindLink <noreply@sandeepa.dev>"'),
      'KindLink <noreply@sandeepa.dev>'
    );
    assert.equal(
      getResendFromAddress("'KindLink <noreply@sandeepa.dev>'"),
      'KindLink <noreply@sandeepa.dev>'
    );
  });

  await t.test('formats bare email address with KindLink name', () => {
    assert.equal(
      getResendFromAddress('noreply@sandeepa.dev'),
      'KindLink <noreply@sandeepa.dev>'
    );
    assert.equal(
      getResendFromAddress('support@sandeepa.dev'),
      'KindLink <support@sandeepa.dev>'
    );
  });

  await t.test('preserves valid Name <email@domain> format', () => {
    assert.equal(
      getResendFromAddress('KindLink <noreply@sandeepa.dev>'),
      'KindLink <noreply@sandeepa.dev>'
    );
    assert.equal(
      getResendFromAddress('KindLink Support <support@sandeepa.dev>'),
      'KindLink Support <support@sandeepa.dev>'
    );
  });

  await t.test('auto-prepends local part if angle brackets lack @', () => {
    assert.equal(
      getResendFromAddress('KindLink <sandeepa.dev>'),
      'KindLink <noreply@sandeepa.dev>'
    );
  });

  await t.test('falls back to default onboarding address when empty or undefined', () => {
    assert.equal(getResendFromAddress(''), 'KindLink <onboarding@resend.dev>');
    assert.equal(getResendFromAddress(null), 'KindLink <onboarding@resend.dev>');
    assert.equal(getResendFromAddress(undefined), 'KindLink <onboarding@resend.dev>');
  });
});
