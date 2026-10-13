from decimal import Decimal
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.course import Category, Course, CourseSection, Lesson, LessonResource, CourseDifficulty, LessonType
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from app.models.payment import PricingPlan, BillingInterval
from app.models.workshop import WorkshopCity, WorkshopTopic
from app.models.home_nursing import HomeNursingService
from app.models.article import ArticleCategory, Article
from app.models.webinar import Speaker, Webinar
from app.models.cms import CMSSection, CMSContentBlock, NavigationItem, SiteSetting

async def seed_database(db: AsyncSession):
    # Check if already seeded
    user_check = await db.execute(select(User).where(User.email == "admin@nurslab.ro"))
    if user_check.scalar_one_or_none():
        print("Database already contains seed data.")
        return

    print("Seeding database with NursLab Romanian medical educational content...")

    # 1. Users
    admin_user = User(
        email="admin@nurslab.ro",
        hashed_password=get_password_hash("Admin123!"),
        full_name="Admin NursLab",
        role=UserRole.SUPER_ADMIN,
        is_active=True,
        is_verified=True,
        phone="+40720000001",
        hospital_affiliation="Centrul Medical NursLab",
        nursing_specialty="Administrație & Management Medical"
    )
    instructor_user = User(
        email="dr.elena@nurslab.ro",
        hashed_password=get_password_hash("Instructor123!"),
        full_name="Asist. Univ. Elena Popescu",
        role=UserRole.INSTRUCTOR,
        is_active=True,
        is_verified=True,
        phone="+40720000002",
        hospital_affiliation="Spitalul Clinic de Urgență Floreasca București",
        nursing_specialty="Terapie Intensivă & Urgențe Medicale",
        bio="Peste 14 ani de experiență clinică în secții de Terapie Intensivă și formator atestat în nursing clinic."
    )
    student_user = User(
        email="student@nurslab.ro",
        hashed_password=get_password_hash("Student123!"),
        full_name="Maria Ionescu",
        role=UserRole.STUDENT,
        is_active=True,
        is_verified=True,
        phone="+40720000003",
        hospital_affiliation="Spitalul Județean de Urgență Cluj",
        nursing_specialty="Medicină Internă"
    )
    db.add_all([admin_user, instructor_user, student_user])
    await db.flush()

    # 2. Navigation items
    nav_items = [
        NavigationItem(label="Acasă", url="/", order_index=0, is_visible=True),
        NavigationItem(label="Învățare online", url="/courses", order_index=1, is_visible=True),
        NavigationItem(label="Practică fizică", url="/workshops", order_index=2, is_visible=True),
        NavigationItem(label="Webinarii", url="/webinars", order_index=3, is_visible=True),
        NavigationItem(label="Invitați", url="/invitati", order_index=4, is_visible=True),
        NavigationItem(label="Îngrijire holistică", url="/holistic", order_index=5, is_visible=True),
        NavigationItem(label="Lumea medicală", url="/articles", order_index=6, is_visible=True),
        NavigationItem(label="Gratuit", url="/courses?free=true", order_index=7, is_visible=True),
    ]
    db.add_all(nav_items)

    # 3. CMS Sections & Content Blocks
    # 3.1 Hero Section
    sec_hero = CMSSection(
        section_key="hero",
        kicker="RESURSE, CURSURI ȘI WORKSHOPURI PENTRU ASISTENȚI MEDICALI",
        title="De la prima lecție la practică.",
        subtitle="Un parcurs care îmbină teoria, demonstrațiile video și workshopurile fizice.",
        is_visible=True,
        display_order=1,
        metadata_json={
            "sticky_note": "Mai multă încredere în practica de zi cu zi. ❤️",
            "cta_primary_label": "Începe gratuit",
            "cta_primary_url": "/courses?free=true",
            "cta_secondary_label": "Explorează cursurile",
            "cta_secondary_url": "/courses"
        }
    )
    db.add(sec_hero)

    # 3.2 Learning Paths ("Alege cum începi")
    sec_paths = CMSSection(
        section_key="learning_paths",
        kicker="ETAPE DE ÎNVĂȚARE",
        title="Alege cum începi",
        subtitle="Resurse gratuite, cursuri online și workshopuri fizice – pentru fiecare etapă a ta.",
        is_visible=True,
        display_order=2
    )
    db.add(sec_paths)

    blocks_paths = [
        CMSContentBlock(
            section_key="learning_paths",
            block_key="free_resources",
            title="Resurse gratuite",
            content="Lecții introductive, videoclipuri și fișe de studiu.",
            badge="GRATUIT",
            badge_variant="mint",
            icon="book-open",
            link_label="Începe gratuit",
            link_url="/courses?free=true",
            display_order=1,
            is_active=True,
            image_url="/images/free_resources.jpg"
        ),
        CMSContentBlock(
            section_key="learning_paths",
            block_key="online_courses",
            title="Cursuri online",
            content="Teorie, demonstrații video și teste de verificare.",
            badge="CU PLATĂ",
            badge_variant="coral",
            icon="play-circle",
            link_label="Vezi cursurile",
            link_url="/courses",
            display_order=2,
            is_active=True,
            image_url="/images/online_courses.jpg"
        ),
        CMSContentBlock(
            section_key="learning_paths",
            block_key="physical_workshops",
            title="Workshopuri fizice",
            content="Practică supravegheată, în grupe restrânse.",
            badge="CU PLATĂ",
            badge_variant="coral",
            icon="users",
            link_label="Vezi workshopurile",
            link_url="/workshops",
            display_order=3,
            is_active=True,
            image_url="/images/workshops_nurses.jpg"
        )
    ]
    db.add_all(blocks_paths)

    # 3.3 Learning Journey ("Parcursul tău NursLab")
    sec_journey = CMSSection(
        section_key="learning_journey",
        title="Parcursul tău NursLab",
        subtitle="Pași clari, de la primele noțiuni până la exersarea în mâinile tale.",
        is_visible=True,
        display_order=3
    )
    db.add(sec_journey)

    blocks_journey = [
        CMSContentBlock(
            section_key="learning_journey",
            block_key="step_1_theory",
            title="1. Înțelegi teoria",
            content="Cursuri online, pe teme esențiale, structurate clar și ușor de parcurs.",
            icon="book-open",
            display_order=1,
            is_active=True,
            image_url="/images/journey_theory.jpg"
        ),
        CMSContentBlock(
            section_key="learning_journey",
            block_key="step_2_demo",
            title="2. Vezi demonstrația",
            content="Demonstrații video realizate de profesioniști, cu explicații pas cu pas.",
            icon="play-circle",
            display_order=2,
            is_active=True,
            image_url="/images/journey_demo.jpg"
        ),
        CMSContentBlock(
            section_key="learning_journey",
            block_key="step_3_quiz",
            title="3. Verifici ce ai învățat",
            content="Întrebări și situații practice care te ajută să îți consolidezi cunoștințele.",
            icon="check-square",
            display_order=3,
            is_active=True,
            image_url="/images/journey_feedback.jpg"
        ),
        CMSContentBlock(
            section_key="learning_journey",
            block_key="step_4_workshop",
            title="4. Exersezi la workshop",
            content="Aplici în siguranță, alături de formatori, pe simulatoare și echipamente reale.",
            icon="shield-check",
            display_order=4,
            is_active=True,
            image_url="/images/journey_practice.jpg"
        ),
    ]
    db.add_all(blocks_journey)

    # 3.4 Local Workshops ("Adu practica în orașul tău")
    sec_city = CMSSection(
        section_key="local_workshops",
        title="Adu practica în orașul tău",
        subtitle="Spune-ne ce te interesează și te anunțăm când se formează o grupă de workshop în orașul tău.",
        is_visible=True,
        display_order=4,
        metadata_json={
            "disclaimer": "Lista de interes este gratuită. Workshopurile sunt cu plată.",
            "cta_label": "Anunță-mă când se formează grupa"
        }
    )
    db.add(sec_city)

    # 3.5 Home Nursing ("Îngrijiri la domiciliu")
    sec_nursing = CMSSection(
        section_key="home_nursing",
        title="Îngrijiri la domiciliu",
        subtitle="Sprijin și îngrijire, în confortul casei tale.",
        is_visible=True,
        display_order=5,
        metadata_json={
            "cta_label": "Solicită îngrijire",
            "cta_url": "/home-nursing",
            "microcopy": "Trimite o solicitare pentru detalii și disponibilitate.",
            "image_url": "/images/home_nursing.jpg"
        }
    )
    db.add(sec_nursing)

    # 3.6 Holistic Nursing ("Abordarea holistică a îngrijirii pacienților")
    sec_holistic = CMSSection(
        section_key="holistic_care",
        title="Abordarea holistică a îngrijirii pacienților",
        subtitle="Grijă pentru persoană, în toate dimensiunile sale.",
        is_visible=True,
        display_order=6,
        metadata_json={
            "cta_label": "Descoperă abordarea holistică",
            "cta_url": "/holistic"
        }
    )
    db.add(sec_holistic)

    blocks_holistic = [
        CMSContentBlock(
            section_key="holistic_care",
            block_key="physical_care",
            title="Îngrijire fizică",
            content="Confort și nevoi fizice.",
            icon="heart",
            display_order=1,
            is_active=True
        ),
        CMSContentBlock(
            section_key="holistic_care",
            block_key="emotional_care",
            title="Îngrijire psiho-emoțională",
            content="Ascultare, empatie și sprijin emoțional.",
            icon="message-circle",
            display_order=2,
            is_active=True
        ),
        CMSContentBlock(
            section_key="holistic_care",
            block_key="spiritual_care",
            title="Îngrijire spirituală",
            content="Respect pentru valorile și convingerile personale.",
            icon="leaf",
            display_order=3,
            is_active=True
        ),
        CMSContentBlock(
            section_key="holistic_care",
            block_key="social_care",
            title="Îngrijire socială",
            content="Relații, familie și sprijin în comunitate.",
            icon="users",
            display_order=4,
            is_active=True
        ),
    ]
    db.add_all(blocks_holistic)

    # 3.7 Guests & Webinars ("Invitați NursLab")
    sec_guests = CMSSection(
        section_key="guests_webinars",
        title="Invitați NursLab",
        subtitle="Perspective și experiențe din practica medicală.",
        is_visible=True,
        display_order=7,
        metadata_json={
            "cta_label": "Descoperă invitații",
            "cta_url": "/invitati"
        }
    )
    db.add(sec_guests)

    blocks_guests = [
        CMSContentBlock(
            section_key="guests_webinars",
            block_key="specialist_interviews",
            title="Interviuri cu specialiști",
            badge="INTERVIU",
            badge_variant="mint",
            link_url="/invitati",
            display_order=1,
            is_active=True,
            image_url="/images/guest_ana.jpg"
        ),
        CMSContentBlock(
            section_key="guests_webinars",
            block_key="guest_webinars",
            title="Webinarii cu invitați",
            badge="LIVE",
            badge_variant="coral",
            link_url="/webinars?type=live",
            display_order=2,
            is_active=True,
            image_url="/images/guest_radu.jpg"
        ),
        CMSContentBlock(
            section_key="guests_webinars",
            block_key="patient_discussions",
            title="Discuții cu pacienți și aparținători",
            badge="DISCUȚIE",
            badge_variant="sky",
            link_url="/webinars?type=discussion",
            display_order=3,
            is_active=True,
            image_url="/images/guest_elena.jpg"
        )
    ]
    db.add_all(blocks_guests)

    # 3.8 Medical World ("Lumea medicală")
    sec_articles = CMSSection(
        section_key="medical_world",
        title="Lumea medicală",
        subtitle="Articole, interviuri și noutăți pentru comunitatea medicală.",
        is_visible=True,
        display_order=8,
        metadata_json={
            "cta_label": "Explorează articolele",
            "cta_url": "/articles"
        }
    )
    db.add(sec_articles)

    blocks_articles = [
        CMSContentBlock(
            section_key="medical_world",
            block_key="people_in_medicine",
            title="Oameni din lumea medicală",
            link_url="/articles?cat=oameni-din-lumea-medicala",
            display_order=1,
            is_active=True,
            image_url="/images/medical_world_emergency.jpg"
        ),
        CMSContentBlock(
            section_key="medical_world",
            block_key="education_career",
            title="Educație și carieră",
            link_url="/articles?cat=educatie-si-cariera",
            display_order=2,
            is_active=True,
            image_url="/images/medical_world_care.jpg"
        ),
        CMSContentBlock(
            section_key="medical_world",
            block_key="nursing_technology",
            title="Tehnologie în îngrijire",
            link_url="/articles?cat=tehnologie-in-ingrijire",
            display_order=3,
            is_active=True,
            image_url="/images/medical_world_ethics.jpg"
        )
    ]
    db.add_all(blocks_articles)

    # 4. Pricing Plans
    plan_monthly = PricingPlan(
        name="Abonament Lunar NursLab",
        slug="abonament-lunar",
        description="Acces nelimitat la întreaga bibliotecă de cursuri online, teste grilă și actualizări continue.",
        billing_interval=BillingInterval.MONTHLY,
        price=Decimal("49.00"),
        currency="RON",
        features_json=[
            "Acces complet la toate cursurile video online",
            "Demonstrații clinice pas cu pas filmate în detaliu",
            "Teste grilă de autoevaluare nelimitate",
            "Certificate de absolvire descărcabile în format PDF",
            "Acces la comunitatea privată a asistenților medicali"
        ],
        badge="Popular"
    )
    plan_annual = PricingPlan(
        name="Abonament Anual NursLab Pro",
        slug="abonament-anual",
        description="Pachet complet pentru dezvoltare continuă cu economie de 23% și reducere la workshopuri practice.",
        billing_interval=BillingInterval.ANNUAL,
        price=Decimal("450.00"),
        currency="RON",
        features_json=[
            "Toate beneficiile planului lunar timp de 12 luni",
            "2 luni gratuite (economie de 138 RON)",
            "15% reducere la orice workshop fizic din orașul tău",
            "Invitații prioritare la sesiunile de webinarii live cu medici specialiști",
            "Suport educațional dedicat și fișe clinice descărcabile"
        ],
        badge="Cel mai avantajos"
    )
    db.add_all([plan_monthly, plan_annual])

    # 5. Workshop Cities & Topics
    cities = [
        WorkshopCity(name="București", county="București", display_order=1),
        WorkshopCity(name="Cluj-Napoca", county="Cluj", display_order=2),
        WorkshopCity(name="Iași", county="Iași", display_order=3),
        WorkshopCity(name="Timișoara", county="Timiș", display_order=4),
        WorkshopCity(name="Brașov", county="Brașov", display_order=5),
        WorkshopCity(name="Constanța", county="Constanța", display_order=6),
        WorkshopCity(name="Craiova", county="Dolj", display_order=7),
        WorkshopCity(name="Sibiu", county="Sibiu", display_order=8),
        WorkshopCity(name="Oradea", county="Bihor", display_order=9),
    ]
    topics = [
        WorkshopTopic(
            title="Recoltare venoasă și cateterism periferic avansat",
            slug="recoltare-venoasa-cateterism",
            description="Exersare pe simulatoare anatomice a tehnicilor de canulare venoasă periferică dificilă, recoltare de sânge și prevenirea flebitelor.",
            display_order=1
        ),
        WorkshopTopic(
            title="Suport Vital de Bază (BLS) și Defibrilare Automată Externă",
            slug="bls-resuscitare-cardio-respiratorie",
            description="Antrenament practic de compresii toracice de înaltă calitate, ventilație pe balon-mască și utilizarea defibrilatorului automat (AED).",
            display_order=2
        ),
        WorkshopTopic(
            title="Managementul plăgilor complexe și pansamente moderne",
            slug="pansamente-plagi-complexe",
            description="Clasificarea plăgilor (escare, ulcere venoase), debridare conservatoare și aplicarea pansamentelor hidrocoloide și cu argint.",
            display_order=3
        ),
        WorkshopTopic(
            title="Administrarea terapiei intravenoase și transfuzii de sânge",
            slug="terapie-intravenoasa-transfuzii",
            description="Calculul debitului de perfuzie, verificarea compatibilităților transfuzionale și recunoașterea reacțiilor adverse acute.",
            display_order=4
        ),
    ]
    db.add_all(cities)
    db.add_all(topics)

    # 6. Home Nursing Services
    home_services = [
        HomeNursingService(
            title="Administrare tratamente injectabile & perfuzii",
            description="Injecții intramusculare, subcutanate, intravenoase și perfuzii la domiciliu conform prescripției medicale a medicului curant.",
            price_estimate="de la 60 RON",
            icon="syringe",
            display_order=1
        ),
        HomeNursingService(
            title="Toaletă și pansament escare / plăgi chirurgicale",
            description="Îngrijirea escarelor de decubit, a ulcerelor diabetice și schimbarea pansamentelor sterile cu materiale moderne hidroactive.",
            price_estimate="de la 90 RON",
            icon="shield",
            display_order=2
        ),
        HomeNursingService(
            title="Recoltare probe biologice la domiciliu",
            description="Recoltare de sânge, urină și exudate pentru analize de laborator, fără disconfortul deplasării pacientului imobilizat.",
            price_estimate="de la 70 RON",
            icon="flask",
            display_order=3
        ),
        HomeNursingService(
            title="Montare / schimbare sondă urinară & nazogastrică",
            description="Manopere efectuate în condiții riguroase de asepsie de către asistenți medicali cu experiență clinică.",
            price_estimate="de la 120 RON",
            icon="activity",
            display_order=4
        ),
        HomeNursingService(
            title="Monitorizare parametri vitali & EKG",
            description="Măsurarea tensiunii arteriale, pulsului, saturației O2, glicemiei și realizarea de electrocardiograme la domiciliu.",
            price_estimate="de la 50 RON",
            icon="heart",
            display_order=5
        ),
    ]
    db.add_all(home_services)

    # 7. Categories & Courses
    cat_practice = Category(name="Practică Clinică & Tehnici", slug="practica-clinica", description="Manevre de bază și avansate în îngrijirea pacienților", icon="activity", display_order=1)
    cat_urgency = Category(name="Urgențe & Terapie Intensivă", slug="urgente-terapie-intensiva", description="Protocoale de resuscitare și intervenție rapidă", icon="alert-circle", display_order=2)
    cat_holistic = Category(name="Nursing Holistic & Relație Pacient", slug="nursing-holistic", description="Comunicare, empatie și îngrijire integrată", icon="heart", display_order=3)
    db.add_all([cat_practice, cat_urgency, cat_holistic])
    await db.flush()

    # Course 1: Free Course on Venipuncture
    c1 = Course(
        title="Tehnici Avansate de Recoltare Sanguină și Puncție Venoasă",
        slug="tehnici-recoltare-sanguina-punctie-venoasa",
        short_description="Ghid practic esențial pentru identificarea venelor dificile, utilizarea sistemelor vacuumate și prevenirea hemolizei.",
        full_description="""Acest curs oferă o pregătire completă pentru una dintre cele mai frecvente manevre din practica asistentului medical: puncția venoasă și recoltarea de sânge.

Vei învăța:
- Anatomia patului venos al brațului și antebrațului
- Alegerea corectă a acelor și a tuburilor de recoltare (codul culorilor vacutainer)
- Manevre pentru vene colabate sau fragile la pacienți vârstnici și oncologici
- Ordinea corectă a eprubetelor pentru evitarea contaminării probelor
- Identificarea complicațiilor imediate (hematom, sincope vaso-vagale) și gestionarea lor.""",
        cover_image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
        preview_video_url="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        instructor_id=instructor_user.id,
        category_id=cat_practice.id,
        difficulty=CourseDifficulty.BEGINNER,
        estimated_hours=4,
        is_free=True,
        price=Decimal("0.00"),
        currency="RON",
        is_published=True,
        featured=True,
        has_certificate=True,
        completion_threshold_percent=80
    )
    db.add(c1)
    await db.flush()

    # Sections & Lessons for Course 1
    s1_1 = CourseSection(course_id=c1.id, title="Modul 1: Pregătirea și Asepsia", order_index=1)
    s1_2 = CourseSection(course_id=c1.id, title="Modul 2: Tehnica Puncției și Recoltarea", order_index=2)
    db.add_all([s1_1, s1_2])
    await db.flush()

    l1_1 = Lesson(
        section_id=s1_1.id,
        title="1. Materiale necesare și codul culorilor eprubetelor",
        slug="materiale-necesare-codul-culorilor",
        description="Prezentarea detaliată a sistemelor vacuumate și a aditivilor anticoagulanți (EDTA, citrat, heparină, gel separator).",
        lesson_type=LessonType.VIDEO,
        video_url="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        duration_minutes=18,
        is_preview=True,
        order_index=1,
        content_markdown="""### Codul culorilor în sistemul de recoltare cu vacutainer

Ordinea corectă de umplere a eprubetelor (CLSI guidelines):
1. **Flacoane de hemocultură** (sticle speciale)
2. **Capac albastru deschis** (Citrat de sodiu pentru coagulare)
3. **Capac roșu sau auriu** (Ser / Gel separator pentru biochimie și imunologie)
4. **Capac verde** (Heparină)
5. **Capac mov / lavandă** (EDTA K2/K3 pentru hemoleucogramă)
6. **Capac gri** (Fluorură de sodiu / Oxalat pentru glicemie)

*Regulă de aur*: Niciodată nu agitați energic eprubetele! Efectuați doar mișcări lente de inversare de 5-8 ori pentru a preveni hemoliza."""
    )
    l1_2 = Lesson(
        section_id=s1_2.id,
        title="2. Demonstrație video: Puncția venoasă pas cu pas",
        slug="demonstratie-punctie-venoasa-pas-cu-pas",
        description="Procedura completă filmată din perspectivă directă pe manechin și pacient voluntar.",
        lesson_type=LessonType.VIDEO,
        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration_minutes=24,
        is_preview=False,
        order_index=2,
        content_markdown="""### Etapele puncției venoase
1. Dezinfectarea mâinilor și îmbrăcarea mănușilor de examinare.
2. Aplicarea garoului la 7-10 cm deasupra locului selectat (maximum 60 secunde).
3. Palparea venei (nu ne bazăm doar pe vizibilitate, ci pe elasticitate).
4. Antisepsia tegumentului cu tampon cu alcool izopropilic în cercuri concentrice din centru spre periferie.
5. Inserția acului la un unghi de 15-30 de grade, cu bizoul orientat în sus.
6. Eliberarea garoului imediat ce sângele începe să curgă în prima eprubetă."""
    )
    l1_3 = Lesson(
        section_id=s1_2.id,
        title="3. Test de evaluare finală",
        slug="test-evaluare-punctie-venoasa",
        description="Verifică-ți cunoștințele pentru a obține certificatul de absolvire.",
        lesson_type=LessonType.QUIZ,
        duration_minutes=15,
        is_preview=False,
        order_index=3,
        content_markdown="Testul conține 3 întrebări clinice cu răspuns unic. Scorul de trecere este de 70%."
    )
    db.add_all([l1_1, l1_2, l1_3])
    await db.flush()

    # Quiz for Course 1
    quiz1 = Quiz(
        lesson_id=l1_3.id,
        title="Evaluare Tehnici de Recoltare Venoasă",
        description="Testează-ți cunoștințele privind ordinea eprubetelor, antisepsia și prevenirea hemolizei.",
        passing_score_percent=70,
        max_attempts=3
    )
    db.add(quiz1)
    await db.flush()

    q1_1 = QuizQuestion(
        quiz_id=quiz1.id,
        question_text="Care este ordinea corectă de recoltare între eprubeta cu capac mov (EDTA) și cea cu capac albastru deschis (Citrat pentru coagulogramă)?",
        explanation="Eprubeta cu citrat (albastru) se recoltează întotdeauna înaintea celei cu EDTA (mov) pentru a evita contaminarea cu potasiu/EDTA ce ar altera timpii de coagulare.",
        order_index=1
    )
    db.add(q1_1)
    await db.flush()
    db.add_all([
        QuizOption(question_id=q1_1.id, option_text="Întotdeauna eprubeta cu capac albastru (citrat) se recoltează înaintea celei cu capac mov (EDTA)", is_correct=True, order_index=1),
        QuizOption(question_id=q1_1.id, option_text="Eprubeta cu capac mov (EDTA) se recoltează prima", is_correct=False, order_index=2),
        QuizOption(question_id=q1_1.id, option_text="Ordinea este indiferentă atâta timp cât se folosește același ac", is_correct=False, order_index=3),
    ])

    q1_2 = QuizQuestion(
        quiz_id=quiz1.id,
        question_text="Cât timp este recomandat să fie menținut garoul pe brațul pacientului înainte de puncție?",
        explanation="Menținerea garoului peste 1 minut determină hemoconcentrație și alterarea parametrilor de laborator (creșterea proteinelor totale, potasiului și enzimelor).",
        order_index=2
    )
    db.add(q1_2)
    await db.flush()
    db.add_all([
        QuizOption(question_id=q1_2.id, option_text="Maximum 60 de secunde (1 minut)", is_correct=True, order_index=1),
        QuizOption(question_id=q1_2.id, option_text="Cel puțin 3-5 minute pentru o dilatare venoasă maximă", is_correct=False, order_index=2),
        QuizOption(question_id=q1_2.id, option_text="Până la finalizarea recoltării tuturor eprubetelor", is_correct=False, order_index=3),
    ])

    # Course 2: Paid Course on BLS & Resuscitation (199 RON)
    c2 = Course(
        title="Suport Vital de Bază (BLS) și Manevre de Resuscitare Cardio-Respiratorie",
        slug="suport-vital-baza-bls-resuscitare",
        short_description="Protocolul ERC actualizat: recunoașterea stopului cardiorespirator, compresiuni de calitate și defibrilare automată.",
        full_description="""Curs acreditat conform ghidurilor Consiliului European de Resuscitare (ERC).

Destinat asistenților medicali care activează în spitale, ambulatorii sau îngrijiri la domiciliu. Vei dobândi reflexele clinice salvatoare de vieți:
- Secvența de siguranță și evaluarea stării de conștiență și a respirației
- Ritmul și adâncimea compresiilor toracice conform celor mai noi standarde (100-120/min, 5-6 cm adâncime)
- Utilizarea balonului de ventilație Ruben cu mască și rezervor de O2
- Operarea defibrilatorului automat extern (AED) în spații clinice și publice
- Algoritmul de dezobstrucție a căilor aeriene (manevra Heimlich) la adult și copil.""",
        cover_image="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
        preview_video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        instructor_id=instructor_user.id,
        category_id=cat_urgency.id,
        difficulty=CourseDifficulty.INTERMEDIATE,
        estimated_hours=6,
        is_free=False,
        price=Decimal("199.00"),
        currency="RON",
        is_published=True,
        featured=True,
        has_certificate=True,
        completion_threshold_percent=80
    )
    db.add(c2)
    await db.flush()

    s2_1 = CourseSection(course_id=c2.id, title="Modul 1: Recunoaștere și Algoritm BLS", order_index=1)
    db.add(s2_1)
    await db.flush()

    l2_1 = Lesson(
        section_id=s2_1.id,
        title="1. Evaluarea rapidă a victimei și apelul de urgență",
        slug="evaluarea-rapida-victimei-bls",
        description="Diferențierea respirației agonice (gasping) de respirația normală și activarea codului de urgență.",
        lesson_type=LessonType.VIDEO,
        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        duration_minutes=20,
        is_preview=True,
        order_index=1,
        content_markdown="Manevrele de evaluare: Siguranța salvatorului -> Nivel de conștiență -> Căi aeriene -> Respirație timp de 10 secunde."
    )
    l2_2 = Lesson(
        section_id=s2_1.id,
        title="2. Tehnica compresiunilor toracice și ventilația",
        slug="tehnica-compresiunilor-toracice",
        description="Mecanica corectă a corpului salvatorului pentru evitarea epuizării fizice și menținerea fracțiunii de compresie peste 80%.",
        lesson_type=LessonType.VIDEO,
        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        duration_minutes=25,
        is_preview=False,
        order_index=2,
        content_markdown="Raportul 30:2, poziționarea mâinilor pe jumătatea inferioară a sternului și decompresia completă."
    )
    db.add_all([l2_1, l2_2])

    # Course 3: Paid Course on Wound Care (249 RON)
    c3 = Course(
        title="Managementul Plăgilor Cronice și Pansamente Moderne",
        slug="managementul-plagilor-cronice-pansamente-moderne",
        short_description="Abordarea integrată a escarelor, ulcerelor de gambă și plăgilor chirurgicale dehiscente cu terapie umedă.",
        full_description="Îngrijirea plăgilor cronice reprezintă o provocare zilnică în nursing. Cursul abordează conceptul TIME de pregătire a patului plăgii, alegerea pansamentului optim și prevenirea infecțiilor nozocomiale.",
        cover_image="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
        instructor_id=instructor_user.id,
        category_id=cat_practice.id,
        difficulty=CourseDifficulty.ADVANCED,
        estimated_hours=8,
        is_free=False,
        price=Decimal("249.00"),
        currency="RON",
        is_published=True,
        featured=True,
        has_certificate=True
    )
    db.add(c3)

    # Course 4: Free Course on Medication Safety
    c4 = Course(
        title="Administrarea Sigură a Medicației și Calculul Dozelor",
        slug="administrarea-sigura-medicatiei-calculul-dozelor",
        short_description="Regula celor 5 'C', calcule pentru diluții, microperfuzii și prevenirea erorilor de medicație.",
        full_description="Ghid practic de matematică clinică aplicată: formule rapide pentru calculul dozelor la adult și pediatric, ritmuri de perfuzie (picături/minut vs ml/oră).",
        cover_image="https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=80",
        instructor_id=instructor_user.id,
        category_id=cat_practice.id,
        difficulty=CourseDifficulty.BEGINNER,
        estimated_hours=4,
        is_free=True,
        price=Decimal("0.00"),
        currency="RON",
        is_published=True,
        featured=False,
        has_certificate=True
    )
    db.add(c4)

    # Course 5: Critical Situations on Shift
    c5 = Course(
        title="Gestionarea Situațiilor Critice în Gardă",
        slug="gestionarea-situatiilor-critice-in-garda",
        short_description="Protocol clinic de triaj, intervenție rapidă și prioritizarea pacienților decompensați în tura de noapte și UPU.",
        full_description="""Curs clinic specializat pentru asistenți medicali: managementul urgențelor majore, comunicare în echipă sub presiune, protocoale ABCDE și resuscitare imediată.

Vei învăța:
- Algoritmul rapid de evaluare a stabilității hemodinamice
- Prioritizarea resurselor când gestionezi simultan mai mulți pacienți critici
- Tehnici de comunicare SBAR cu medicii de gardă pentru decizii rapide
- Pregătirea medicației de urgență și manevrelor de intubație / ventilație asistată.""",
        cover_image="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
        preview_video_url="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        instructor_id=instructor_user.id,
        category_id=cat_urgency.id,
        difficulty=CourseDifficulty.INTERMEDIATE,
        estimated_hours=6,
        is_free=False,
        price=Decimal("149.00"),
        currency="RON",
        is_published=True,
        featured=True,
        has_certificate=True,
        completion_threshold_percent=80
    )
    db.add(c5)
    await db.flush()

    s5_1 = CourseSection(course_id=c5.id, title="Modul 1: Algoritmul de Triaj și Prioritizare", order_index=1)
    db.add(s5_1)
    await db.flush()

    l5_1 = Lesson(
        section_id=s5_1.id,
        title="1. Evaluarea ABCDE în urgențe majore",
        slug="evaluarea-abcde-in-urgente-majore",
        description="Abordarea sistematică a căilor aeriene, respirației și circulației.",
        lesson_type=LessonType.VIDEO,
        video_url="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        duration_minutes=20,
        is_preview=True,
        order_index=1,
        content_markdown="Protocolul de evaluare primară ABCDE în camera de gardă..."
    )
    l5_2 = Lesson(
        section_id=s5_1.id,
        title="2. Comunicarea în criză (SBAR) și handover eficient",
        slug="comunicarea-in-criza-sbar",
        description="Transmiterea informațiilor critice între asistent și medic în situații limită.",
        lesson_type=LessonType.VIDEO,
        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration_minutes=25,
        is_preview=False,
        order_index=2,
        content_markdown="Metoda SBAR (Situation, Background, Assessment, Recommendation)..."
    )
    db.add_all([l5_1, l5_2])

    # 8. Medical Articles ("Lumea medicală")
    art_cat1 = ArticleCategory(name="Oameni din lumea medicală", slug="oameni-din-lumea-medicala")
    art_cat2 = ArticleCategory(name="Educație și carieră", slug="educatie-si-cariera")
    art_cat3 = ArticleCategory(name="Tehnologie în îngrijire", slug="tehnologie-in-ingrijire")
    db.add_all([art_cat1, art_cat2, art_cat3])
    await db.flush()

    articles = [
        Article(
            title="O zi în Terapie Intensivă: Lecții de reziliență de la asistentul de la patul bolnavului",
            slug="o-zi-in-terapie-intensiva-lectii-rezilienta",
            excerpt="Cum gestionează echipa de asistenți medicali provocările pacienților ventilați mecanic și comunicarea cu familiile îngrijorate.",
            content_markdown="""Practica de nursing în Terapia Intensivă (ATI) este adesea descrisă ca o linie fină între precizie tehnologică extremă și empatie profundă. 

Fiecare tură începe cu raportul de predare: alarmele monitoarelor, valorile gazelor sanguine arteriale, dozele de inotrope și perfuziile continue. Dar dincolo de cifre, asistentul este cel care observă prima schimbare subtilă în reflexele sau privirea pacientului.

În acest interviu, Mihaela D., asistentă principală cu 18 ani de experiență, vorbește despre importanța formării continue și a sprijinului colegial pentru prevenirea burnout-ului.""",
            cover_image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
            author_name="Redacția NursLab",
            category_id=art_cat1.id,
            reading_time_minutes=6,
            published_at=datetime.now(timezone.utc) - timedelta(days=2)
        ),
        Article(
            title="Ghid de orientare profesională: Pași către specializarea în nursing clinic avansat",
            slug="ghid-orientare-profesionala-nursing-clinic",
            excerpt="Oportunități de dezvoltare, cursuri de perfecționare și trasee de carieră pentru tinerii absolvenți de școală postliceală și facultate de moașe și asistență medicală.",
            content_markdown="""Piața medicală din România trece printr-o transformare rapidă. Spitalele private și centrele universitare caută asistenți medicali nu doar cu diplome, ci cu competențe practice demonstrate: certificări BLS/ALS, cunoștințe de management al plăgilor și abilități solide de comunicare interpersonală.""",
            cover_image="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
            author_name="Asist. Univ. Elena Popescu",
            category_id=art_cat2.id,
            reading_time_minutes=8,
            published_at=datetime.now(timezone.utc) - timedelta(days=5)
        ),
        Article(
            title="Inovații în dispozitivele medicale pentru monitorizarea continuă a pacienților",
            slug="inovatii-dispozitive-medicale-monitorizare-continua",
            excerpt="Senzori wireless, pompe inteligente de perfuzie și dosarul electronic al pacientului: cum tehnologia eliberează timp pentru îngrijirea umană.",
            content_markdown="""Tehnologia nu înlocuiește asistentul medical, ci îi amplifică acuitatea clinică. Noile generații de infuzomate cu sisteme de verificare a dozei previn supradozajele accidentale, în timp ce senzorii neinvazivi semnalează din timp deteriorarea stării hemodinamice.""",
            cover_image="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
            author_name="Ing. Biomed. Radu Moldovan",
            category_id=art_cat3.id,
            reading_time_minutes=5,
            published_at=datetime.now(timezone.utc) - timedelta(days=9)
        )
    ]
    db.add_all(articles)

    # 9. Speakers & Webinars ("Invitați NursLab")
    spk1 = Speaker(
        full_name="Dr. Cristian Andrei",
        title="Medic Primar Medicină de Urgență",
        hospital="UPU-SMURD București",
        bio="Peste 20 de ani de experiență în medicina de urgență prespitalicească și spitalicească.",
        photo_url="/images/guest_radu.jpg"
    )
    spk2 = Speaker(
        full_name="Asist. Șef Dana Radu",
        title="Președinte Asociație de Nursing Clinic",
        hospital="Institutul Oncologic",
        bio="Lider în standardizarea protocoalelor de îngrijire și siguranță a pacientului.",
        photo_url="/images/guest_ana.jpg"
    )
    db.add_all([spk1, spk2])
    await db.flush()

    web1 = Webinar(
        title="Webinar Live: Gestionarea Situațiilor Critice în Gardă",
        slug="webinar-live-gestionarea-situatiilor-critice",
        description="Cum prioritizezi intervențiile când primești simultan mai mulți pacienți decompensați: comunicare în echipă și protocoale de triaj.",
        webinar_type="live",
        badge="LIVE",
        scheduled_at=datetime.now(timezone.utc) + timedelta(days=4, hours=5),
        duration_minutes=90,
        cover_image="/images/guest_radu.jpg",
        speaker_id=spk1.id,
        is_free=True
    )
    web2 = Webinar(
        title="Interviu Special: Relația terapeutică și comunicarea veștilor dificile",
        slug="interviu-relatia-terapeutica-comunicare",
        description="Dialog deschis despre suportul emoțional acordat familiilor pacienților cronici și îngrijirea paliativă la domiciliu.",
        webinar_type="interview",
        badge="INTERVIU",
        scheduled_at=datetime.now(timezone.utc) - timedelta(days=3),
        duration_minutes=60,
        cover_image="/images/guest_ana.jpg",
        speaker_id=spk2.id,
        is_free=True,
        recording_url="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
    )
    db.add_all([web1, web2])

    await db.commit()
    print("Database seeding completed successfully!")
