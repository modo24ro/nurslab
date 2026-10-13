import json
import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.cms import SiteSetting, AuditLog

DEFAULT_SETTINGS = [
    # --- 1. GENERAL WEBSITE SETTINGS ---
    {
        "key": "general_site_name",
        "value": "NursLab - Practică Clinică & Formare Medicală",
        "category": "general",
        "description": "Numele afișat al platformei",
        "is_secret": False,
    },
    {
        "key": "general_site_url",
        "value": "http://localhost:3000",
        "category": "general",
        "description": "Adresa URL publică a platformei",
        "is_secret": False,
    },
    {
        "key": "general_canonical_url",
        "value": "https://nurslab.ro",
        "category": "general",
        "description": "URL canonic de bază pentru indexare",
        "is_secret": False,
    },
    {
        "key": "general_org_name",
        "value": "NursLab Medical Education",
        "category": "general",
        "description": "Numele organizației / asociației",
        "is_secret": False,
    },
    {
        "key": "general_default_language",
        "value": "ro",
        "category": "general",
        "description": "Limba implicită a platformei",
        "is_secret": False,
    },
    {
        "key": "general_default_timezone",
        "value": "Europe/Bucharest",
        "category": "general",
        "description": "Fusul orar de referință",
        "is_secret": False,
    },
    {
        "key": "general_default_currency",
        "value": "RON",
        "category": "general",
        "description": "Moneda implicită afișată",
        "is_secret": False,
    },
    {
        "key": "general_contact_email",
        "value": "contact@nurslab.ro",
        "category": "general",
        "description": "Email public de contact",
        "is_secret": False,
    },
    {
        "key": "general_contact_phone",
        "value": "+40 700 000 000",
        "category": "general",
        "description": "Număr de telefon public de asistență",
        "is_secret": False,
    },
    {
        "key": "general_business_address",
        "value": "Str. Sănătății Nr. 10, Sector 1, București, România",
        "category": "general",
        "description": "Adresa fizică a sediului",
        "is_secret": False,
    },
    {
        "key": "general_logo_url",
        "value": "/images/logo.png",
        "category": "general",
        "description": "Calea sau URL-ul siglei oficiale",
        "is_secret": False,
    },
    {
        "key": "general_favicon_url",
        "value": "/favicon.ico",
        "category": "general",
        "description": "Pictogramă browser (favicon)",
        "is_secret": False,
    },
    {
        "key": "general_social_facebook",
        "value": "https://facebook.com/nurslab",
        "category": "general",
        "description": "Pagină Facebook oficială",
        "is_secret": False,
    },
    {
        "key": "general_social_instagram",
        "value": "https://instagram.com/nurslab",
        "category": "general",
        "description": "Cont Instagram oficial",
        "is_secret": False,
    },
    {
        "key": "general_social_linkedin",
        "value": "https://linkedin.com/company/nurslab",
        "category": "general",
        "description": "Profil LinkedIn companie",
        "is_secret": False,
    },
    {
        "key": "general_social_youtube",
        "value": "https://youtube.com/@nurslab",
        "category": "general",
        "description": "Canal YouTube",
        "is_secret": False,
    },
    {
        "key": "general_seo_title",
        "value": "NursLab | Resurse, Cursuri și Workshopuri pentru Asistenți Medicali",
        "category": "general",
        "description": "Titlu SEO implicit pentru motoarele de căutare",
        "is_secret": False,
    },
    {
        "key": "general_seo_description",
        "value": "Platformă educațională acreditată pentru asistenți medicali: cursuri video pas cu pas, transmisiuni de gardă, proceduri ATI și simulatoare clinice.",
        "category": "general",
        "description": "Meta descriere implicită a site-ului",
        "is_secret": False,
    },
    {
        "key": "general_og_image",
        "value": "/images/hero_nurses.jpg",
        "category": "general",
        "description": "Imagine reprezentativă Social Share (Open Graph)",
        "is_secret": False,
    },
    {
        "key": "general_maintenance_mode",
        "value": "false",
        "category": "general",
        "description": "Mod mentenanță activat/dezactivat",
        "is_secret": False,
    },

    # --- 2. EMAIL & SMTP CONFIGURATION ---
    {
        "key": "email_smtp_host",
        "value": "smtp.gmail.com",
        "category": "email",
        "description": "Server SMTP (Hostname)",
        "is_secret": False,
    },
    {
        "key": "email_smtp_port",
        "value": "587",
        "category": "email",
        "description": "Port server SMTP (ex: 587 sau 465)",
        "is_secret": False,
    },
    {
        "key": "email_smtp_encryption",
        "value": "tls",
        "category": "email",
        "description": "Tip criptare conexiune: tls, ssl sau none",
        "is_secret": False,
    },
    {
        "key": "email_smtp_username",
        "value": "notificari@nurslab.ro",
        "category": "email",
        "description": "Utilizator / Cont autentificare SMTP",
        "is_secret": False,
    },
    {
        "key": "email_smtp_password",
        "value": "",
        "category": "email",
        "description": "Parolă server SMTP sau App Password",
        "is_secret": True,
    },
    {
        "key": "email_smtp_from_name",
        "value": "NursLab Educație Medicală",
        "category": "email",
        "description": "Numele expeditorului afișat în inbox",
        "is_secret": False,
    },
    {
        "key": "email_smtp_from_email",
        "value": "noreply@nurslab.ro",
        "category": "email",
        "description": "Adresa de email a expeditorului",
        "is_secret": False,
    },
    {
        "key": "email_smtp_reply_to",
        "value": "contact@nurslab.ro",
        "category": "email",
        "description": "Adresă Reply-To pentru răspunsuri",
        "is_secret": False,
    },
    {
        "key": "email_smtp_timeout_seconds",
        "value": "10",
        "category": "email",
        "description": "Timeout conexiune SMTP în secunde",
        "is_secret": False,
    },

    # --- 3. BILLING & ORGANIZATION PROFILE ---
    {
        "key": "billing_company_legal_name",
        "value": "NursLab Medical Education S.R.L.",
        "category": "billing",
        "description": "Denumirea oficială a societății comerciale",
        "is_secret": False,
    },
    {
        "key": "billing_company_cui",
        "value": "RO12345678",
        "category": "billing",
        "description": "Cod Unic de Înregistrare (CUI / CIF)",
        "is_secret": False,
    },
    {
        "key": "billing_company_reg_com",
        "value": "J40/1234/2026",
        "category": "billing",
        "description": "Număr de ordine în Registrul Comerțului",
        "is_secret": False,
    },
    {
        "key": "billing_company_address",
        "value": "Str. Sănătății Nr. 10, Sector 1, București",
        "category": "billing",
        "description": "Adresa sediului social înregistrat",
        "is_secret": False,
    },
    {
        "key": "billing_company_country",
        "value": "România",
        "category": "billing",
        "description": "Țara sediului social",
        "is_secret": False,
    },
    {
        "key": "billing_company_county",
        "value": "București",
        "category": "billing",
        "description": "Județ / Regiune",
        "is_secret": False,
    },
    {
        "key": "billing_company_city",
        "value": "Sector 1",
        "category": "billing",
        "description": "Oraș / Localitate",
        "is_secret": False,
    },
    {
        "key": "billing_company_postal_code",
        "value": "010000",
        "category": "billing",
        "description": "Cod poștal",
        "is_secret": False,
    },
    {
        "key": "billing_contact_name",
        "value": "Departament Financiar NursLab",
        "category": "billing",
        "description": "Persoană de contact pentru facturare",
        "is_secret": False,
    },
    {
        "key": "billing_email",
        "value": "financiar@nurslab.ro",
        "category": "billing",
        "description": "Email dedicat facturare și documente contabile",
        "is_secret": False,
    },
    {
        "key": "billing_phone",
        "value": "+40 700 000 000",
        "category": "billing",
        "description": "Telefon contact departament financiar",
        "is_secret": False,
    },
    {
        "key": "billing_company_iban",
        "value": "RO98BTRL00000000000000XX",
        "category": "billing",
        "description": "Cont bancar IBAN oficial",
        "is_secret": False,
    },
    {
        "key": "billing_company_bank",
        "value": "Banca Transilvania",
        "category": "billing",
        "description": "Banca unde este deschis contul",
        "is_secret": False,
    },
    {
        "key": "billing_invoice_series",
        "value": "NLB",
        "category": "billing",
        "description": "Serie facturi fiscale emise",
        "is_secret": False,
    },
    {
        "key": "billing_invoice_start_number",
        "value": "1001",
        "category": "billing",
        "description": "Număr de start pentru numerotarea facturilor",
        "is_secret": False,
    },
    {
        "key": "billing_invoice_footer_note",
        "value": "Factură fiscală emisă conform legislației în vigoare. Vă mulțumim pentru participare!",
        "category": "billing",
        "description": "Notă / Mențiune subsol factură",
        "is_secret": False,
    },
    {
        "key": "billing_invoice_vat_rate",
        "value": "19",
        "category": "billing",
        "description": "Cotă TVA procentuală (ex: 19)",
        "is_secret": False,
    },

    # --- 4. PAYMENT PROVIDER INTEGRATION ---
    {
        "key": "payment_stripe_enabled",
        "value": "true",
        "category": "payment",
        "description": "Activare modul procesare plăți cu cardul",
        "is_secret": False,
    },
    {
        "key": "payment_stripe_mode",
        "value": "test",
        "category": "payment",
        "description": "Mod de operare: 'test' sau 'live'",
        "is_secret": False,
    },
    {
        "key": "payment_stripe_public_key",
        "value": "pk_test_sample_nurslab_public",
        "category": "payment",
        "description": "Cheie publică Stripe (Publishable Key)",
        "is_secret": False,
    },
    {
        "key": "payment_stripe_secret_key",
        "value": "sk_test_sample_nurslab_secret",
        "category": "payment",
        "description": "Cheie secretă Stripe API",
        "is_secret": True,
    },
    {
        "key": "payment_stripe_webhook_secret",
        "value": "whsec_sample_webhook_secret",
        "category": "payment",
        "description": "Secret semnare webhook Stripe",
        "is_secret": True,
    },
    {
        "key": "payment_currency",
        "value": "RON",
        "category": "payment",
        "description": "Monedă de încasare principală",
        "is_secret": False,
    },
    {
        "key": "payment_supported_currencies",
        "value": "RON, EUR",
        "category": "payment",
        "description": "Monede acceptate la checkout",
        "is_secret": False,
    },

    # --- 5. REUSABLE CATALOGS ---
    {
        "key": "catalogs_course_levels",
        "value": json.dumps(["beginner", "intermediate", "advanced"]),
        "category": "catalogs",
        "description": "Niveluri de dificultate cursuri",
        "is_secret": False,
    },
    {
        "key": "catalogs_course_formats",
        "value": json.dumps(["online", "in-person", "hybrid"]),
        "category": "catalogs",
        "description": "Formate de predare cursuri",
        "is_secret": False,
    },
    {
        "key": "catalogs_instructor_specialties",
        "value": json.dumps([
            "ATI & Terapie Intensivă",
            "Urgențe Medicale (UPU)",
            "Chirurgie Generală",
            "Pediatrie & Neonatologie",
            "Cardiologie Clinică",
            "Îngrijiri Paliative & Geriatrie"
        ]),
        "category": "catalogs",
        "description": "Specialități medicale disponibile pentru instructori",
        "is_secret": False,
    },
    {
        "key": "catalogs_lesson_types",
        "value": json.dumps(["video", "article", "quiz", "workshop"]),
        "category": "catalogs",
        "description": "Tipuri permise de lecție în curriculum",
        "is_secret": False,
    },

    # --- 6. SYSTEM & INTEGRATIONS ---
    {
        "key": "system_max_upload_size_mb",
        "value": "50",
        "category": "system",
        "description": "Limită maximă încărcare fișiere (MB)",
        "is_secret": False,
    },
    {
        "key": "system_allowed_upload_types",
        "value": "image/jpeg, image/png, image/webp, application/pdf, video/mp4",
        "category": "system",
        "description": "Tipuri MIME permise la upload",
        "is_secret": False,
    },
    {
        "key": "system_video_provider",
        "value": "direct",
        "category": "system",
        "description": "Furnizor video implicit: 'direct', 'vimeo', 'youtube'",
        "is_secret": False,
    },
    {
        "key": "system_analytics_google_id",
        "value": "",
        "category": "system",
        "description": "Google Analytics ID (ex: G-XXXXXXXXXX)",
        "is_secret": False,
    },
    {
        "key": "system_facebook_pixel_id",
        "value": "",
        "category": "system",
        "description": "Meta Pixel ID",
        "is_secret": False,
    },
    {
        "key": "system_enable_captcha",
        "value": "false",
        "category": "system",
        "description": "Protecție anti-bot la formulare",
        "is_secret": False,
    },
]

async def seed_default_settings_if_missing(db: AsyncSession):
    """Seed any default settings keys that do not already exist."""
    res = await db.execute(select(SiteSetting))
    existing_keys = {s.setting_key for s in res.scalars().all()}

    added = False
    for item in DEFAULT_SETTINGS:
        if item["key"] not in existing_keys:
            s = SiteSetting(
                setting_key=item["key"],
                setting_value=item["value"],
                category=item["category"],
                description=item["description"],
                is_secret=item["is_secret"],
            )
            db.add(s)
            added = True

    if added:
        await db.commit()

async def get_all_settings_dict(db: AsyncSession, mask_secrets: bool = True) -> Dict[str, Any]:
    """Retrieve all settings as a dict, optionally masking secret keys."""
    await seed_default_settings_if_missing(db)
    res = await db.execute(select(SiteSetting))
    settings_rows = res.scalars().all()

    result = {}
    for row in settings_rows:
        val = row.setting_value
        if mask_secrets and row.is_secret:
            val = "••••••••" if (val and val.strip()) else ""
        result[row.setting_key] = {
            "value": val,
            "category": row.category or "general",
            "description": row.description,
            "is_secret": row.is_secret,
        }
    return result

async def get_setting_value_raw(db: AsyncSession, key: str, default: str = "") -> str:
    """Retrieve raw setting value without masking (internal backend use)."""
    res = await db.execute(select(SiteSetting).where(SiteSetting.setting_key == key))
    row = res.scalar_one_or_none()
    if row:
        return row.setting_value
    # Fallback to defaults
    for item in DEFAULT_SETTINGS:
        if item["key"] == key:
            return item["value"]
    return default

async def update_settings_bulk(db: AsyncSession, updates: Dict[str, str], admin_user_id: Optional[str] = None, admin_email: Optional[str] = None) -> Dict[str, Any]:
    """Update settings in bulk safely, preserving masked secrets when not changed."""
    res = await db.execute(select(SiteSetting))
    existing_map = {s.setting_key: s for s in res.scalars().all()}

    changed_keys = []
    for k, v in updates.items():
        if k in existing_map:
            row = existing_map[k]
            # If secret and incoming value is masked or empty string, preserve current
            if row.is_secret and (v == "••••••••" or v == ""):
                continue
            if row.setting_value != v:
                row.setting_value = v
                changed_keys.append(k)
        else:
            # New setting
            desc = None
            cat = "general"
            is_sec = False
            for d in DEFAULT_SETTINGS:
                if d["key"] == k:
                    desc = d["description"]
                    cat = d["category"]
                    is_sec = d["is_secret"]
                    break
            new_row = SiteSetting(
                setting_key=k,
                setting_value=v,
                description=desc,
                category=cat,
                is_secret=is_sec
            )
            db.add(new_row)
            changed_keys.append(k)

    if changed_keys:
        # Audit Log
        audit = AuditLog(
            user_id=admin_user_id,
            user_email=admin_email,
            action="UPDATE_SETTINGS",
            resource_type="site_settings",
            resource_id="bulk",
            details={"updated_keys": [k for k in changed_keys if not existing_map.get(k, None) or not existing_map[k].is_secret]}
        )
        db.add(audit)
        await db.commit()

    return {"status": "success", "updated_count": len(changed_keys)}

def send_test_smtp_email(
    to_email: str,
    smtp_host: str,
    smtp_port: int,
    smtp_encryption: str,
    smtp_username: Optional[str],
    smtp_password: Optional[str],
    smtp_from_name: Optional[str],
    smtp_from_email: Optional[str],
    timeout: int = 10
) -> Dict[str, Any]:
    """Test SMTP connection, encryption handshake, and send test message."""
    if not smtp_host:
        return {"success": False, "message": "Eroare: Adresa serverului SMTP (Host) este obligatorie."}

    from_addr = smtp_from_email or smtp_username or "noreply@nurslab.ro"
    sender_display = smtp_from_name or "NursLab Platform"

    msg = MIMEMultipart()
    msg['From'] = f"{sender_display} <{from_addr}>"
    msg['To'] = to_email
    msg['Subject'] = "✅ Test Conexiune Server Email - NursLab"

    body_content = (
        "Bună ziua,\n\n"
        "Acesta este un email de verificare trimis automat din Panoul de Administrare NursLab.\n\n"
        f"Server SMTP: {smtp_host}:{smtp_port}\n"
        f"Protocol Criptare: {smtp_encryption.upper()}\n"
        f"Expeditor: {from_addr}\n\n"
        "Dacă ați primit acest mesaj, configurația dumneavoastră SMTP funcționează perfect!\n\n"
        "Echipa NursLab"
    )
    msg.attach(MIMEText(body_content, 'plain', 'utf-8'))

    try:
        if smtp_encryption.lower() == 'ssl' or smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=timeout)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=timeout)
            if smtp_encryption.lower() == 'tls' or smtp_port == 587:
                server.starttls()

        if smtp_username and smtp_password:
            server.login(smtp_username, smtp_password)

        server.sendmail(from_addr, [to_email], msg.as_string())
        server.quit()
        return {
            "success": True,
            "message": f"Emailul de test a fost expediat cu succes către {to_email}! Verificați căsuța de primire."
        }
    except smtplib.SMTPAuthenticationError:
        return {
            "success": False,
            "message": "Autentificare SMTP eșuată. Verificați utilizatorul și parola introduse."
        }
    except (socket.gaierror, socket.timeout):
        return {
            "success": False,
            "message": f"Conexiunea către {smtp_host}:{smtp_port} a expirat sau adresa este inaccesibilă."
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Eroare SMTP: {str(e)}"
        }

def test_stripe_configuration(secret_key: str, mode: str = "test") -> Dict[str, Any]:
    """Test Stripe API credentials format and diagnostic status."""
    if not secret_key or secret_key.strip() == "":
        return {"success": False, "message": "Introduceți cheia secretă Stripe (Secret Key)."}

    clean_key = secret_key.strip()
    if clean_key == "••••••••":
        return {
            "success": True,
            "message": "Cheia secretă Stripe configurată anterior este stocată în mod securizat pe server."
        }

    # Verify standard Stripe key prefix
    if mode == "test" and not clean_key.startswith("sk_test_"):
        return {
            "success": False,
            "message": "Pentru modul de testare, cheia secretă Stripe trebuie să înceapă cu 'sk_test_'."
        }
    if mode == "live" and not clean_key.startswith("sk_live_"):
        return {
            "success": False,
            "message": "Pentru modul LIVE de producție, cheia secretă Stripe trebuie să înceapă cu 'sk_live_'."
        }

    return {
        "success": True,
        "message": f"Cheia secretă Stripe pentru modul '{mode.upper()}' este validă structural și pregătită pentru tranzacții."
    }
