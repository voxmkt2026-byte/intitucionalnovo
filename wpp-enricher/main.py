import os
import random
import re
import shutil
import sys
import time
import unicodedata
from datetime import datetime
from pathlib import Path

import pandas as pd
from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError, sync_playwright


BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"
PROFILE_DIR = BASE_DIR / "whatsapp-profile"

DEFAULT_COUNTRY_CODE = "55"
MIN_DELAY_SECONDS = 4.0
MAX_DELAY_SECONDS = 8.0
CHAT_TIMEOUT_SECONDS = 25
SAVE_EVERY = 5

RESULT_COLUMNS = [
    "telefone_normalizado",
    "nome_whatsapp",
    "possui_whatsapp",
    "status_consulta",
    "consultado_em",
]
FINISHED_STATUSES = {"encontrado", "sem_whatsapp"}
UI_LABELS = {
    "dados do perfil",
    "dados do contato",
    "detalhes do perfil",
    "informacoes do perfil",
    "informacoes do contato",
    "profile details",
    "profile info",
    "contact info",
    "contact details",
    "perfil",
    "profile",
    "fechar",
    "close",
    "nome",
    "name",
    "recado",
    "about",
    "midia, links e documentos",
    "media, links and docs",
    "mensagens favoritas",
    "starred messages",
    "silenciar notificacoes",
    "mute notifications",
    "mensagens temporarias",
    "disappearing messages",
    "criptografia",
    "encryption",
    "pesquisar",
    "buscar",
    "search",
    "menu",
    "mais",
    "more",
    "video",
    "ligacao",
    "chamada",
    "voice call",
    "video call",
}


def is_interface_label(value: object) -> bool:
    """Rejeita rótulos dos botões do WhatsApp confundidos com o nome."""
    normalized = normalize_text(value)
    if normalized in UI_LABELS:
        return True
    fragments = (
        "dados do perfil",
        "detalhes do perfil",
        "informacoes do perfil",
        "informacoes do contato",
        "profile details",
        "profile info",
        "contact info",
    )
    return any(fragment in normalized for fragment in fragments)


def find_browser_executable() -> str | None:
    """Localiza um Chrome/Edge já instalado e evita baixar o Chromium."""
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    candidates = [
        Path(os.environ.get("PROGRAMFILES", r"C:\Program Files"))
        / "Google/Chrome/Application/chrome.exe",
        Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"))
        / "Google/Chrome/Application/chrome.exe",
        Path(local_app_data) / "Google/Chrome/Application/chrome.exe",
        Path(os.environ.get("PROGRAMFILES", r"C:\Program Files"))
        / "Microsoft/Edge/Application/msedge.exe",
        Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"))
        / "Microsoft/Edge/Application/msedge.exe",
        Path(local_app_data) / "Microsoft/Edge/Application/msedge.exe",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)

    # Também cobre instalações disponíveis no PATH.
    for command in ("chrome", "chrome.exe", "msedge", "msedge.exe"):
        located = shutil.which(command)
        if located:
            return located
    return None


def log(message: str = "") -> None:
    print(message, flush=True)


def normalize_text(value: object) -> str:
    if value is None:
        return ""
    text = unicodedata.normalize("NFKD", str(value))
    return "".join(char for char in text if not unicodedata.combining(char)).lower().strip()


def normalize_phone(value: object) -> str | None:
    if value is None or pd.isna(value):
        return None

    text = str(value).strip()
    # Evita o sufixo criado pelo Excel ao ler números como ponto flutuante.
    text = re.sub(r"\.0+$", "", text)
    digits = re.sub(r"\D", "", text).lstrip("0")

    if digits.startswith("055"):
        digits = digits[1:]
    if len(digits) in (10, 11):
        digits = DEFAULT_COUNTRY_CODE + digits
    if not 10 <= len(digits) <= 15:
        return None
    return digits


def phone_like(value: object) -> bool:
    if value is None or pd.isna(value):
        return False
    raw_digits = re.sub(r"\D", "", str(value))
    return 10 <= len(raw_digits.lstrip("0")) <= 15


def find_input_file() -> Path:
    files = sorted(
        path
        for path in INPUT_DIR.iterdir()
        if path.is_file()
        and path.suffix.lower() in {".xlsx", ".xls", ".csv"}
        and not path.name.startswith("~$")
    )
    if not files:
        raise FileNotFoundError(f"Nenhuma planilha encontrada em:\n{INPUT_DIR}")
    if len(files) == 1:
        return files[0]

    log("Encontrei mais de uma planilha:")
    for index, path in enumerate(files, 1):
        log(f"  [{index}] {path.name}")
    while True:
        try:
            choice = int(input("Escolha o número da planilha: "))
            if 1 <= choice <= len(files):
                return files[choice - 1]
        except (ValueError, EOFError):
            pass
        log("Opção inválida.")


def load_dataframe(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        for encoding in ("utf-8-sig", "utf-8", "latin1"):
            try:
                return pd.read_csv(path, dtype=str, encoding=encoding, sep=None, engine="python")
            except UnicodeDecodeError:
                continue
        raise ValueError("Não foi possível identificar a codificação do CSV.")
    return pd.read_excel(path, dtype=str)


def detect_phone_column(df: pd.DataFrame) -> str | None:
    keywords = ("whatsapp", "whats", "wpp", "telefone", "tel", "celular", "mobile", "phone", "fone", "numero", "contato")
    candidates: list[tuple[str, int, int]] = []

    for column in df.columns:
        normalized = normalize_text(column)
        keyword_score = sum(20 for keyword in keywords if keyword in normalized)
        sample = df[column].dropna().head(100)
        valid_count = sum(phone_like(value) for value in sample)
        candidates.append((str(column), keyword_score + valid_count, valid_count))

    if not candidates:
        return None
    best_column, best_score, best_valid_count = max(candidates, key=lambda item: item[1])
    return best_column if best_score > 0 and best_valid_count > 0 else None


def choose_phone_column(df: pd.DataFrame) -> str:
    detected = detect_phone_column(df)
    if detected:
        return detected

    log("Não consegui detectar a coluna de telefone.")
    for index, column in enumerate(df.columns, 1):
        log(f"  [{index}] {column}")
    while True:
        try:
            choice = int(input("Escolha o número da coluna de telefone: "))
            if 1 <= choice <= len(df.columns):
                return str(df.columns[choice - 1])
        except (ValueError, EOFError):
            pass
        log("Opção inválida.")


def save_dataframe(df: pd.DataFrame, output_path: Path) -> None:
    temporary_path = output_path.with_name(f"{output_path.stem}_temporario.xlsx")
    df.to_excel(temporary_path, index=False)
    os.replace(temporary_path, output_path)


def wait_for_login(page: Page) -> None:
    log("Abrindo o WhatsApp Web...")
    page.goto("https://web.whatsapp.com", wait_until="domcontentloaded", timeout=60_000)
    log("Se aparecer um QR Code, conecte o seu WhatsApp. A continuação é automática.")

    while True:
        if page.locator("#pane-side").count() > 0:
            log("WhatsApp conectado.")
            return
        time.sleep(1.5)


def page_text(page: Page) -> str:
    try:
        return normalize_text(page.locator("body").inner_text(timeout=2_000))
    except Exception:
        return ""


def has_invalid_number_message(page: Page) -> bool:
    text = page_text(page)
    messages = (
        "phone number shared via url is invalid",
        "phone number isn't on whatsapp",
        "phone number is not on whatsapp",
        "numero de telefone compartilhado atraves da url e invalido",
        "numero de telefone compartilhado por url e invalido",
        "numero de telefone nao e valido",
        "nao esta no whatsapp",
        "numero invalido",
    )
    return any(message in text for message in messages)


def extract_header_label(page: Page) -> str | None:
    main = page.locator("#main")
    if main.count() == 0:
        return None
    header = main.locator("header").first
    if header.count() == 0:
        return None

    candidates: list[str] = []

    # O primeiro span de texto costuma ser o nome. Elementos [title] incluem
    # botões como "Dados do perfil", por isso entram apenas como alternativa.
    for locator in (header.locator("span[dir='auto']"), header.locator("[title]")):
        for index in range(min(locator.count(), 30)):
            element = locator.nth(index)
            try:
                if not element.is_visible():
                    continue
                text = (element.get_attribute("title") or element.inner_text()).strip()
                if text and not is_interface_label(text):
                    candidates.append(text)
            except Exception:
                continue

    return candidates[0] if candidates else None


def is_phone_label(label: str, requested_phone: str) -> bool:
    label_digits = re.sub(r"\D", "", label)
    return bool(label_digits) and (label_digits == requested_phone or label_digits.endswith(requested_phone[-10:]))


def open_profile_panel(page: Page) -> bool:
    """Abre o painel em que algumas versões do WhatsApp mostram o nome."""
    header = page.locator("#main header").first
    if header.count() == 0:
        return False

    # Procura primeiro o controle explicitamente rotulado "Dados do perfil".
    titled = header.locator("[title]")
    for index in range(min(titled.count(), 30)):
        element = titled.nth(index)
        try:
            title = element.get_attribute("title") or ""
            normalized = normalize_text(title)
            if any(fragment in normalized for fragment in (
                "dados do perfil", "detalhes do perfil", "profile details", "profile info"
            )):
                element.click(timeout=3_000)
                time.sleep(1.2)
                return True
        except Exception:
            continue

    # Em algumas compilações o título não existe; clicar na área esquerda do
    # cabeçalho (avatar/número) abre o mesmo painel.
    try:
        box = header.bounding_box()
        if box:
            page.mouse.click(box["x"] + min(180, box["width"] * 0.25), box["y"] + box["height"] / 2)
            time.sleep(1.2)
            return True
    except Exception:
        pass
    return False


def extract_profile_name(page: Page, requested_phone: str) -> str | None:
    """Lê o primeiro texto útil no painel direito de dados do perfil."""
    elements = page.locator("span[dir='auto'], [title]")
    try:
        raw_candidates = elements.evaluate_all(
            """(nodes) => nodes.map((node) => {
                const rect = node.getBoundingClientRect();
                const style = window.getComputedStyle(node);
                return {
                    text: (node.getAttribute('title') || node.textContent || '').trim(),
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    visible: style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0,
                    viewport: window.innerWidth
                };
            })"""
        )
    except Exception:
        return None

    candidates: list[tuple[float, str]] = []
    seen: set[str] = set()
    for item in raw_candidates:
        text = str(item.get("text") or "").strip()
        if not text or text in seen or not item.get("visible"):
            continue
        seen.add(text)
        # O drawer de perfil ocupa o lado direito da janela.
        if float(item.get("x") or 0) < float(item.get("viewport") or 0) * 0.62:
            continue
        if is_interface_label(text) or is_phone_label(text, requested_phone):
            continue
        normalized = normalize_text(text)
        if normalized in {"online", "offline", "digitando...", "typing..."}:
            continue
        if len(text) > 120:
            continue
        candidates.append((float(item.get("y") or 0), text))

    candidates.sort(key=lambda candidate: candidate[0])
    return candidates[0][1] if candidates else None


def query_whatsapp(page: Page, phone: str) -> dict[str, str | None]:
    url = f"https://web.whatsapp.com/send?phone={phone}&text&app_absent=0"
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    except PlaywrightTimeoutError:
        pass

    deadline = time.monotonic() + CHAT_TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        if has_invalid_number_message(page):
            return {"name": None, "exists": "NÃO", "status": "sem_whatsapp"}

        label = extract_header_label(page)
        if label:
            if is_phone_label(label, phone):
                if open_profile_panel(page):
                    profile_deadline = time.monotonic() + 8
                    while time.monotonic() < profile_deadline:
                        profile_name = extract_profile_name(page, phone)
                        if profile_name:
                            return {"name": profile_name, "exists": "SIM", "status": "encontrado"}
                        time.sleep(0.5)
                return {"name": None, "exists": "SIM", "status": "numero_exibido"}
            return {"name": label, "exists": "SIM", "status": "encontrado"}
        time.sleep(0.8)

    return {"name": None, "exists": "INDEFINIDO", "status": "nao_identificado"}


def load_cache(output_path: Path) -> dict[str, dict[str, str | None]]:
    if not output_path.exists():
        return {}
    try:
        previous = pd.read_excel(output_path, dtype=str)
    except Exception as error:
        log(f"Aviso: não consegui ler o checkpoint anterior ({error}).")
        return {}

    cache: dict[str, dict[str, str | None]] = {}
    required = {"telefone_normalizado", "status_consulta"}
    if not required.issubset(previous.columns):
        return cache

    for _, row in previous.iterrows():
        phone = normalize_phone(row.get("telefone_normalizado"))
        status = str(row.get("status_consulta") or "")
        cached_name = None if pd.isna(row.get("nome_whatsapp")) else str(row.get("nome_whatsapp"))
        # Versões anteriores podiam gravar "Dados do perfil" como nome.
        # Não reutiliza esse resultado: o telefone será consultado novamente.
        if cached_name and is_interface_label(cached_name):
            continue
        if phone and status in FINISHED_STATUSES:
            cache[phone] = {
                "name": cached_name,
                "exists": None if pd.isna(row.get("possui_whatsapp")) else str(row.get("possui_whatsapp")),
                "status": status,
                "date": None if pd.isna(row.get("consultado_em")) else str(row.get("consultado_em")),
            }
    return cache


def apply_result(df: pd.DataFrame, phone: str, result: dict[str, str | None]) -> None:
    mask = df["telefone_normalizado"].fillna("").astype(str) == phone
    df.loc[mask, "nome_whatsapp"] = result.get("name")
    df.loc[mask, "possui_whatsapp"] = result.get("exists")
    df.loc[mask, "status_consulta"] = result.get("status")
    df.loc[mask, "consultado_em"] = result.get("date") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def main() -> int:
    INPUT_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    PROFILE_DIR.mkdir(exist_ok=True)

    log("=" * 70)
    log("WHATSAPP PLANILHA ENRICHER")
    log("=" * 70)

    try:
        input_file = find_input_file()
        df = load_dataframe(input_file)
    except Exception as error:
        log(f"ERRO: {error}")
        return 1

    if df.empty:
        log("ERRO: a planilha está vazia.")
        return 1

    phone_column = choose_phone_column(df)
    log(f"Arquivo: {input_file.name}")
    log(f"Linhas: {len(df):,} | Coluna de telefone: {phone_column}")

    for column in RESULT_COLUMNS:
        if column not in df.columns:
            df[column] = None
    df["telefone_normalizado"] = df[phone_column].apply(normalize_phone)

    output_file = OUTPUT_DIR / f"{input_file.stem}_enriquecido.xlsx"
    cache = load_cache(output_file)
    unique_numbers = df["telefone_normalizado"].dropna().astype(str).drop_duplicates().tolist()
    invalid_count = int(df["telefone_normalizado"].isna().sum())
    pending = [phone for phone in unique_numbers if phone not in cache]

    for phone, cached in cache.items():
        if phone in unique_numbers:
            apply_result(df, phone, cached)

    log(f"Números únicos válidos: {len(unique_numbers):,}")
    log(f"Já consultados: {len(unique_numbers) - len(pending):,} | Restantes: {len(pending):,}")
    if invalid_count:
        log(f"Linhas com telefone vazio/inválido: {invalid_count:,}")

    if not pending:
        save_dataframe(df, output_file)
        log(f"Nada pendente. Resultado: {output_file}")
        return 0

    processed = 0
    try:
        with sync_playwright() as playwright:
            browser_executable = find_browser_executable()
            if browser_executable:
                log(f"Navegador: {browser_executable}")
            else:
                log("Chrome/Edge não encontrado; tentando o Chromium do Playwright.")

            context = playwright.chromium.launch_persistent_context(
                user_data_dir=str(PROFILE_DIR),
                headless=False,
                viewport={"width": 1400, "height": 900},
                executable_path=browser_executable,
            )
            page = context.pages[0] if context.pages else context.new_page()
            wait_for_login(page)

            for position, phone in enumerate(pending, 1):
                log(f"[{position}/{len(pending)}] Consultando {phone}...")
                try:
                    result = query_whatsapp(page, phone)
                except Exception as error:
                    log(f"  Erro nesta consulta: {type(error).__name__}: {error}")
                    result = {"name": None, "exists": "INDEFINIDO", "status": "erro"}

                apply_result(df, phone, result)
                processed += 1
                if result["status"] == "encontrado":
                    log(f"  Nome exibido: {result['name']}")
                elif result["status"] == "numero_exibido":
                    log("  WhatsApp encontrado, mas somente o número foi exibido.")
                elif result["status"] == "sem_whatsapp":
                    log("  Número sem WhatsApp ou inválido.")
                else:
                    log("  Não foi possível identificar automaticamente.")

                if processed % SAVE_EVERY == 0:
                    save_dataframe(df, output_file)
                    log("  Checkpoint salvo.")
                if position < len(pending):
                    time.sleep(random.uniform(MIN_DELAY_SECONDS, MAX_DELAY_SECONDS))

            save_dataframe(df, output_file)
            context.close()
    except KeyboardInterrupt:
        log("Interrompido pelo usuário; salvando o progresso...")
        save_dataframe(df, output_file)
        return 130
    except Exception as error:
        log(f"ERRO: {type(error).__name__}: {error}")
        save_dataframe(df, output_file)
        log(f"O progresso disponível foi salvo em: {output_file}")
        return 1

    log("=" * 70)
    log("PROCESSAMENTO FINALIZADO")
    log(f"Resultado: {output_file}")
    log("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
