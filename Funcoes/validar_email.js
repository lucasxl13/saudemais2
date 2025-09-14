export function validade_email(v) {
  const probe = document.createElement("input");
  probe.type = "email";
  probe.value = v;
  return probe.checkValidity();
}