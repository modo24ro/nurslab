import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.cms import CMSSection, CMSContentBlock

SECTIONS_TO_ADD = [
    {
        "id": "page-courses-uuid",
        "section_key": "page_courses",
        "title": "Cursuri Medicale & Instruire Clinică",
        "subtitle": "Dezvoltă-ți competențele prin module video pas cu pas, demonstrații practice și validare prin teste grilă.",
        "kicker": "PROGRAME COMPLETE & CURSURI ONLINE",
        "is_visible": True,
        "display_order": 9,
        "metadata_json": {
            "seo_title": "Cursuri Asistenți Medicali & Practică Clinică | NursLab",
            "meta_description": "Explorează catalogul de cursuri video acreditate pentru asistenți medicali: ATI, urgențe, pediatrie, farmacologie clinică.",
            "banner_image": "/images/journey_theory.jpg",
            "badge": "CURSURI PRACTICE"
        }
    },
    {
        "id": "page-workshops-uuid",
        "section_key": "page_workshops",
        "title": "Workshopuri Practice Locale",
        "subtitle": "Adu practica în orașul tău: ateliere hands-on alături de formatori pe simulatoare și echipamente reale.",
        "kicker": "WORKSHOPURI PRACTICE ÎN ORAȘUL TĂU",
        "is_visible": True,
        "display_order": 10,
        "metadata_json": {
            "seo_title": "Workshopuri Practice NursLab | Ateliere Hands-on Medicale",
            "meta_description": "Înscrie-te la workshopurile practice organizate în orașul tău pentru asistenți medicali: canulare venoasă, suport vital de bază.",
            "banner_image": "/images/journey_practice.jpg",
            "contact_email": "workshop@nurslab.ro"
        }
    },
    {
        "id": "page-webinars-uuid",
        "section_key": "page_webinars",
        "title": "Webinarii NursLab",
        "subtitle": "Sesiuni interactive cu medici primari, specialiști și pacienți. Pune întrebări în timp real și aprofundează situații din gardă.",
        "kicker": "CALENDAR SESIUNI LIVE ȘI INTERVIURI",
        "is_visible": True,
        "display_order": 11,
        "metadata_json": {
            "seo_title": "Webinarii Live Medicale & Interviuri Specialiști | NursLab",
            "meta_description": "Urmărește webinarii gratuite și interviuri live cu medici primari și asistenți medicali din spitale de urgență.",
            "banner_image": "/images/guest_radu.jpg"
        }
    },
    {
        "id": "page-guests-uuid",
        "section_key": "page_guests",
        "title": "Invitați NursLab",
        "subtitle": "Perspective și experiențe reale din practica clinică: dialoguri deschise cu medici primari, asistenți șefi, cercetători și lideri din spitalele de urgență.",
        "kicker": "COMUNITATE & EXPERȚI MEDICALI",
        "is_visible": True,
        "display_order": 12,
        "metadata_json": {
            "seo_title": "Invitați și Specialiști Medicali | NursLab",
            "meta_description": "Descoperă medicii și formatorii invitați la NursLab: experiență clinică, interviuri și sesiuni de mentorat.",
            "banner_image": "/images/speaker_dr_andrei_radu.jpg"
        }
    },
    {
        "id": "page-home-nursing-uuid",
        "section_key": "page_home_nursing",
        "title": "Îngrijiri Medicale la Domiciliu",
        "subtitle": "Servicii de asistență medicală profesionistă adaptate nevoilor pacientului, direct în confortul propriei locuințe.",
        "kicker": "SERVICII MEDICALE LA DOMICILIU",
        "is_visible": True,
        "display_order": 13,
        "metadata_json": {
            "seo_title": "Servicii de Îngrijiri Medicale la Domiciliu | NursLab",
            "meta_description": "Solicită îngrijire medicală la domiciliu: tratamente injectabile, pansamente, monitorizare funcții vitale cu asistenți autorizați.",
            "banner_image": "/images/home_nursing.jpg",
            "phone": "+40 700 000 000"
        }
    },
    {
        "id": "page-holistic-uuid",
        "section_key": "page_holistic",
        "title": "Abordarea Holistică în Nursing",
        "subtitle": "Grijă pentru persoană, în toate dimensiunile sale: conexiunea profundă dintre tratamentul clinic, starea emoțională și mediul terapeutic.",
        "kicker": "PERSPECTIVĂ INTEGRATIVĂ",
        "is_visible": True,
        "display_order": 14,
        "metadata_json": {
            "seo_title": "Abordarea Holistică a Îngrijirii Pacienților | NursLab",
            "meta_description": "Află cum integrăm dimensiunile fizice, emoționale, spirituale și sociale în practica modernă de asistență medicală.",
            "banner_image": "/images/home_nursing_holistic.jpg"
        }
    },
    {
        "id": "page-articles-uuid",
        "section_key": "page_articles",
        "title": "Articole și Ghiduri Clinice",
        "subtitle": "Sinteze medicale, protocoale actualizate, studii de caz și bune practici pentru asistenți medicali.",
        "kicker": "RESURSE CLINICE & ARTICOLE",
        "is_visible": True,
        "display_order": 15,
        "metadata_json": {
            "seo_title": "Articole Medicale, Ghiduri & Protocoale | NursLab",
            "meta_description": "Citește articole educaționale și studii de caz realizate de profesioniști din sănătate pentru asistenți medicali.",
            "banner_image": "/images/medical_world_emergency.jpg"
        }
    },
    {
        "id": "page-certificate-uuid",
        "section_key": "page_certificate",
        "title": "Verificare Certificat NursLab",
        "subtitle": "Verifică autenticitatea diplomelor și certificatelor de absolvire emise de platforma educațională NursLab.",
        "kicker": "REGISTRU OFICIAL CERTIFICATE",
        "is_visible": True,
        "display_order": 16,
        "metadata_json": {
            "seo_title": "Verificare Certificat Oficial NursLab",
            "meta_description": "Introdu codul certificatului pentru a valida emiterea și autenticitatea diplomei medicale NursLab.",
            "banner_image": "/images/journey_test.jpg"
        }
    }
]

async def seed_pages():
    async with AsyncSessionLocal() as db:
        for item in SECTIONS_TO_ADD:
            res = await db.execute(select(CMSSection).where(CMSSection.section_key == item["section_key"]))
            existing = res.scalar_one_or_none()
            if not existing:
                sec = CMSSection(**item)
                db.add(sec)
                print(f"Added section: {item['section_key']}")
            else:
                print(f"Section exists: {item['section_key']}")
        await db.commit()
        print("Done seeding CMS page sections!")

if __name__ == "__main__":
    asyncio.run(seed_pages())
