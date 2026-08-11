import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("o menu administrativo existe somente no shell protegido", async () => {
  const [rootLayout, protectedLayout, loginPage] = await Promise.all([
    read("../src/app/admin/layout.tsx"),
    read("../src/app/admin/(protected)/layout.tsx"),
    read("../src/app/admin/(public)/login/page.tsx"),
  ]);

  assert.doesNotMatch(rootLayout, /AdminNavbar/);
  assert.match(protectedLayout, /AdminNavbar/);
  assert.doesNotMatch(loginPage, /AdminNavbar/);
});

test("o login do colaborador usa somente e-mail e senha", async () => {
  const [portalPage, login] = await Promise.all([
    read("../src/app/colaboradores/portal/page.tsx"),
    read("../src/components/PortalLogin.tsx"),
  ]);

  assert.doesNotMatch(portalPage, /<Navbar|<Footer/);
  assert.match(login, /type="email"/);
  assert.match(login, /current-password/);
  assert.doesNotMatch(login, /cpf|cnpj/i);
  assert.match(login, /esqueci-senha/);
});

test("os componentes críticos usam o diálogo compartilhado", async () => {
  const paths = [
    "../src/components/CartaFilters.tsx",
    "../src/components/CartasTable.tsx",
    "../src/components/PortalDashboard.tsx",
    "../src/components/Segments.tsx",
    "../src/components/AdminCartaForm.tsx",
    "../src/app/admin/(protected)/cartas/CartaAdminClient.tsx",
  ];
  const sources = await Promise.all(paths.map(read));

  for (const source of sources) {
    assert.match(source, /design-system\/primitives\/Dialog/);
  }
});
